const pool = require("../config/database");

const TABLE = "books";

const COMPUTED_STATUS = `
  CASE
    WHEN quantity = 0 THEN 'Out of Stock'
    WHEN quantity < 10 THEN 'Low in Stock'
    ELSE 'In Stock'
  END`;

const bookModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT id, title, author, price, quantity, cost_price,
              ${COMPUTED_STATUS} AS status,
              price * quantity AS value
       FROM ${TABLE}
       ORDER BY id ASC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, title, author, price, quantity, cost_price,
              ${COMPUTED_STATUS} AS status,
              price * quantity AS value
       FROM ${TABLE}
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ title, author, price, quantity, cost_price }) {
    const result = await pool.query(
      `INSERT INTO ${TABLE} (title, author, price, quantity, cost_price, status, value)
       SELECT
         v.title,
         v.author,
         v.price,
         v.quantity,
         v.cost_price,
         CASE
           WHEN v.quantity = 0 THEN 'Out of Stock'
           WHEN v.quantity < 10 THEN 'Low in Stock'
           ELSE 'In Stock'
         END,
         v.price * v.quantity
       FROM (VALUES ($1::text, $2::text, $3::real, $4::integer, $5::numeric))
         AS v(title, author, price, quantity, cost_price)
       RETURNING id, title, author, price, quantity, cost_price, status, value`,
      [title, author, price, quantity, cost_price]
    );
    return result.rows[0];
  },

  async update(id, { title, author, price, quantity, cost_price }) {
    const result = await pool.query(
      `UPDATE ${TABLE} AS b
       SET
         title = v.title,
         author = v.author,
         price = v.price,
         quantity = v.quantity,
         cost_price = v.cost_price,
         status = CASE
                    WHEN v.quantity = 0 THEN 'Out of Stock'
                    WHEN v.quantity < 10 THEN 'Low in Stock'
                    ELSE 'In Stock'
                  END,
         value = v.price * v.quantity
       FROM (VALUES ($1::text, $2::text, $3::real, $4::integer, $5::numeric))
         AS v(title, author, price, quantity, cost_price)
       WHERE b.id = $6
       RETURNING b.id, b.title, b.author, b.price, b.quantity, b.cost_price, b.status, b.value`,
      [title, author, price, quantity, cost_price, id]
    );
    return result.rows[0] || null;
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

module.exports = bookModel;
