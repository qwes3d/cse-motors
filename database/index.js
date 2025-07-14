const { Pool } = require("pg");
require("dotenv").config();

const isRender = process.env.DATABASE_URL?.includes("render.com");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false,
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      if (!isRender) console.log("Executed query", { text }); // Log in dev only
      return res;
    } catch (error) {
      console.error("DB Query Error:", error);
      throw error;
    }
  },
};
