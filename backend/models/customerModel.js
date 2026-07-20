const pool = require("../config/database");

const TABLE = "customers";

const CUSTOMER_COLUMNS = `
  id,
  rank,
  name,
  phone,
  sales,
  total_spent,
  profit,
  last_order
`;

const customerModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT ${CUSTOMER_COLUMNS}
       FROM ${TABLE}
       ORDER BY id ASC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${CUSTOMER_COLUMNS}
       FROM ${TABLE}
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ rank, name, phone, sales, total_spent, profit, last_order }) {
    const result = await pool.query(
      `INSERT INTO ${TABLE} (id, rank, name, phone, sales, total_spent, profit, last_order)
       VALUES (
         (SELECT COALESCE(MAX(id), 0) + 1 FROM ${TABLE}),
         $1, $2, $3, $4, $5, $6, $7::timestamp
       )
       RETURNING ${CUSTOMER_COLUMNS}`,
      [rank, name, phone, sales, total_spent, profit, last_order]
    );
    return result.rows[0];
  },

  async update(id, { rank, name, phone, sales, total_spent, profit, last_order }) {
    const result = await pool.query(
      `UPDATE ${TABLE}
       SET
         rank = $1,
         name = $2,
         phone = $3,
         sales = $4,
         total_spent = $5,
         profit = $6,
         last_order = $7::timestamp
       WHERE id = $8
       RETURNING ${CUSTOMER_COLUMNS}`,
      [rank, name, phone, sales, total_spent, profit, last_order, id]
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

module.exports = customerModel;
