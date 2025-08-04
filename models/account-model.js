const pool = require("../database");

/* Register new account */
async function registerAccount(account_firstname, account_lastname, account_email, hashed_password) {
  try {
    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING account_id, account_firstname, account_email
    `;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashed_password
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Model registration error:", error);
    throw error;
  }
}

/* Check for existing email */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount > 0;
  } catch (error) {
    console.error("Email check error:", error);
    throw error;
  }
}

/* Get account by email */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
       FROM account WHERE account_email = $1`,
      [account_email]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error:", error);
    throw error;
  }
}


async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("Database error getting account by ID: " + error.message);
  }
}





async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  const query = `
    UPDATE account 
    SET account_firstname = $1, account_lastname = $2, account_email = $3 
    WHERE account_id = $4 RETURNING *`;
  const result = await pool.query(query, [account_firstname, account_lastname, account_email, account_id]);
  return result.rowCount;
}

/* Update password */
async function updatePassword(account_id, hashed_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
    const result = await pool.query(sql, [hashed_password, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Model update password error:", error);
    throw error;
  }
}




module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updatePassword,
  getAccountById,
  updateAccount
};
