const { Pool } = require("pg")
require("dotenv").config()

// Determine if SSL should be used
const isDev = process.env.NODE_ENV === "development"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDev
    ? { rejectUnauthorized: false } // Allow self-signed certs in dev
    : { rejectUnauthorized: false }, // Required by most managed services like Render
})

// Unified export for both dev and prod
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      if (isDev) console.log("executed query", { text }) // Only log in dev
      return res
    } catch (error) {
      console.error("DB Query Error:", error)
      throw error
    }
  },
}
