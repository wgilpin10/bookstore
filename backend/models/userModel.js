const pool = require("../config/database");

const TABLE = "users";

const USER_COLUMNS = `
  id,
  username,
  password,
  "is_super_admin?" AS is_super_admin,
  email
`;

const userModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS}
       FROM ${TABLE}
       ORDER BY id ASC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS}
       FROM ${TABLE}
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS}
       FROM ${TABLE}
       WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS}
       FROM ${TABLE}
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  async create({ username, password, is_super_admin, email }) {
    const result = await pool.query(
      `INSERT INTO ${TABLE} (id, username, password, "is_super_admin?", email)
       VALUES (
         (SELECT COALESCE(MAX(id), 0) + 1 FROM ${TABLE}),
         $1, $2, $3, $4
       )
       RETURNING ${USER_COLUMNS}`,
      [username, password, is_super_admin, email]
    );
    return result.rows[0];
  },

  async update(id, { username, password, is_super_admin, email }) {
    const result = await pool.query(
      `UPDATE ${TABLE}
       SET
         username = $1,
         password = $2,
         "is_super_admin?" = $3,
         email = $4
       WHERE id = $5
       RETURNING ${USER_COLUMNS}`,
      [username, password, is_super_admin, email, id]
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

module.exports = userModel;
