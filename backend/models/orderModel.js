const pool = require("../config/database");

const TABLE = "orders";

const ORDER_COLUMNS = `
  id,
  "date_&_time" AS date_time,
  book,
  author,
  quantity,
  unit_price,
  revenue,
  profit
`;

const orderModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT ${ORDER_COLUMNS}
       FROM ${TABLE}
       ORDER BY id DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${ORDER_COLUMNS}
       FROM ${TABLE}
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async createSale({ bookId, quantity, dateTime }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const bookResult = await client.query(
        `SELECT id, title, author, price, quantity, cost_price
         FROM books
         WHERE id = $1
         FOR UPDATE`,
        [bookId]
      );

      const book = bookResult.rows[0];

      if (!book) {
        await client.query("ROLLBACK");
        return { error: "Book not found", status: 404 };
      }

      if (book.quantity < quantity) {
        await client.query("ROLLBACK");
        return {
          error: `Insufficient stock. Available: ${book.quantity}`,
          status: 400,
        };
      }

      const unitPrice = Number(book.price);
      const costPrice = Number(book.cost_price ?? 0);
      const revenue = unitPrice * quantity;
      const profit = (unitPrice - costPrice) * quantity;
      const remainingQuantity = book.quantity - quantity;

      const orderResult = await client.query(
        `INSERT INTO ${TABLE} ("date_&_time", book, author, quantity, unit_price, revenue, profit)
         VALUES ($1::timestamptz, $2, $3, $4, $5, $6, $7)
         RETURNING ${ORDER_COLUMNS}`,
        [dateTime, book.title, book.author, quantity, unitPrice, revenue, profit]
      );

      await client.query(
        `UPDATE books
         SET quantity = $1,
             status = CASE
                        WHEN $1 = 0 THEN 'Out of Stock'
                        WHEN $1 < 10 THEN 'Low in Stock'
                        ELSE 'In Stock'
                      END,
             value = price * $1
         WHERE id = $2`,
        [remainingQuantity, bookId]
      );

      await client.query("COMMIT");

      return {
        data: {
          order: orderResult.rows[0],
          book: {
            id: book.id,
            title: book.title,
            remaining_quantity: remainingQuantity,
          },
        },
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id, { dateTime, book, author, quantity, unit_price, revenue, profit }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existingResult = await client.query(
        `SELECT ${ORDER_COLUMNS}
         FROM ${TABLE}
         WHERE id = $1
         FOR UPDATE`,
        [id]
      );

      const existing = existingResult.rows[0];

      if (!existing) {
        await client.query("ROLLBACK");
        return { error: "Order not found", status: 404 };
      }

      const oldBookResult = await client.query(
        `SELECT id, title, author, price, quantity
         FROM books
         WHERE title = $1 AND author = $2
         ORDER BY id ASC
         LIMIT 1
         FOR UPDATE`,
        [existing.book, existing.author]
      );

      const oldBook = oldBookResult.rows[0];

      if (!oldBook) {
        await client.query("ROLLBACK");
        return {
          error: `Book not found for existing order: "${existing.book}" by ${existing.author}`,
          status: 404,
        };
      }

      const sameBook =
        existing.book === book && existing.author === author;

      let targetBook = oldBook;

      if (!sameBook) {
        const newBookResult = await client.query(
          `SELECT id, title, author, price, quantity
           FROM books
           WHERE title = $1 AND author = $2
           ORDER BY id ASC
           LIMIT 1
           FOR UPDATE`,
          [book, author]
        );

        targetBook = newBookResult.rows[0];

        if (!targetBook) {
          await client.query("ROLLBACK");
          return {
            error: `Book not found: "${book}" by ${author}`,
            status: 404,
          };
        }
      }

      const oldQuantity = Number(existing.quantity);
      const newQuantity = Number(quantity);

      if (sameBook) {
        const stockDelta = newQuantity - oldQuantity;
        const remainingQuantity = Number(oldBook.quantity) - stockDelta;

        if (remainingQuantity < 0) {
          await client.query("ROLLBACK");
          return {
            error: `Insufficient stock. Available: ${oldBook.quantity}`,
            status: 400,
          };
        }

        await client.query(
          `UPDATE books
           SET quantity = $1,
               status = CASE
                          WHEN $1 = 0 THEN 'Out of Stock'
                          WHEN $1 < 10 THEN 'Low in Stock'
                          ELSE 'In Stock'
                        END,
               value = price * $1
           WHERE id = $2`,
          [remainingQuantity, oldBook.id]
        );
      } else {
        const restoredQuantity = Number(oldBook.quantity) + oldQuantity;
        const remainingQuantity = Number(targetBook.quantity) - newQuantity;

        if (remainingQuantity < 0) {
          await client.query("ROLLBACK");
          return {
            error: `Insufficient stock for "${book}". Available: ${targetBook.quantity}`,
            status: 400,
          };
        }

        await client.query(
          `UPDATE books
           SET quantity = $1,
               status = CASE
                          WHEN $1 = 0 THEN 'Out of Stock'
                          WHEN $1 < 10 THEN 'Low in Stock'
                          ELSE 'In Stock'
                        END,
               value = price * $1
           WHERE id = $2`,
          [restoredQuantity, oldBook.id]
        );

        await client.query(
          `UPDATE books
           SET quantity = $1,
               status = CASE
                          WHEN $1 = 0 THEN 'Out of Stock'
                          WHEN $1 < 10 THEN 'Low in Stock'
                          ELSE 'In Stock'
                        END,
               value = price * $1
           WHERE id = $2`,
          [remainingQuantity, targetBook.id]
        );
      }

      const orderResult = await client.query(
        `UPDATE ${TABLE}
         SET
           "date_&_time" = $1::timestamp,
           book = $2,
           author = $3,
           quantity = $4,
           unit_price = $5,
           revenue = $6,
           profit = $7
         WHERE id = $8
         RETURNING ${ORDER_COLUMNS}`,
        [dateTime, book, author, quantity, unit_price, revenue, profit, id]
      );

      await client.query("COMMIT");

      return { data: orderResult.rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async remove(id) {
    const result = await pool.query(
      `DELETE FROM ${TABLE}
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = orderModel;
