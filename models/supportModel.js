// === database/supportModel.js ===
const pool = require("../database");

const supportModel = {
  // Create a new support ticket
  async createTicket(account_id, subject, message) {
    const sql = `
      INSERT INTO support_ticket (account_id, subject, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(sql, [account_id, subject, message]);
    return result.rows[0];
  },

  // Get all tickets submitted by a specific user
  async getTicketsByUserId(account_id) {
    const sql = `
      SELECT * FROM support_ticket
      WHERE account_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  },

  // Admin: Get all tickets with user names
  async getAllTickets() {
    const sql = `
      SELECT t.*, a.account_firstname, a.account_lastname
      FROM support_ticket t
      JOIN account a ON t.account_id = a.account_id
      ORDER BY t.created_at DESC;
    `;
    const result = await pool.query(sql);
    return result.rows;
  },

  // Admin: Reply to a ticket
  async replyToTicket(ticket_id, admin_reply, replied_by) {
    const sql = `
      UPDATE support_ticket
      SET admin_reply = $1,
          replied_by = $2,
          replied_at = CURRENT_TIMESTAMP,
          status = 'Replied'
      WHERE ticket_id = $3
      RETURNING *;
    `;
    const result = await pool.query(sql, [admin_reply, replied_by, ticket_id]);
    return result.rows[0];
  },

  // Admin: Close a ticket
  async closeTicket(ticket_id) {
    const sql = `
      UPDATE support_ticket
      SET status = 'Closed',
          closed_at = CURRENT_TIMESTAMP
      WHERE ticket_id = $1
      RETURNING *;
    `;
    const result = await pool.query(sql, [ticket_id]);
    return result.rows[0];
  }
};

module.exports = supportModel;
