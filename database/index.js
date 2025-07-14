const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required by Render’s PostgreSQL
  },
})

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text }) // Optional: disable if noisy
      return res
    } catch (error) {
      console.error("DB Query Error:", error)
      throw error
    }
  },
}
