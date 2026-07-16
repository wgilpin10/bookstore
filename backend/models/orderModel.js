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
         RETURNING
           id,
           "date_&_time" AS date_time,
           book,
           author,
           quantity,
           unit_price,
           revenue,
           profit`,
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
};

module.exports = orderModel;
