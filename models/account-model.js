const pool = require("../database/");
const accountModel = require("../models/account-model");


/* *****************************
 * Register new account
 * *************************** *
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING account_id, account_firstname, account_email";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}
/* ****************************************
*  Process Registration Controller
* *************************************** *
async function processRegistration(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult && regResult.rowCount > 0) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email
    });
  }
}
*/



// models/accountModel.js
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
    return result.rows[0]; // success returns user object
  } catch (error) {
    console.error("Model registration error:", error);
    throw error; // Let the controller handle it
  }
}





/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}




/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}



module.exports = {
  registerAccount,
  checkExistingEmail,
 // processRegistration,
  getAccountByEmail
};

