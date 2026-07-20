const crypto = require("crypto");
const pool = require("../config/database");

const TABLE = "user_invites";

const INVITE_COLUMNS = `
  id,
  username,
  email,
  is_super_admin,
  token,
  expires_at,
  used_at,
  created_at
`;

const inviteModel = {
  async ensureTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  },

  async findByToken(token) {
    const result = await pool.query(
      `SELECT ${INVITE_COLUMNS}
       FROM ${TABLE}
       WHERE token = $1`,
      [token]
    );
    return result.rows[0] || null;
  },

  async create({ username, email, is_super_admin, expiresAt }) {
    const token = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `INSERT INTO ${TABLE} (username, email, is_super_admin, token, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${INVITE_COLUMNS}`,
      [username, email, is_super_admin, token, expiresAt]
    );

    return result.rows[0];
  },

  async markUsed(id) {
    const result = await pool.query(
      `UPDATE ${TABLE}
       SET used_at = NOW()
       WHERE id = $1
       RETURNING ${INVITE_COLUMNS}`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = inviteModel;
