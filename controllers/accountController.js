/*  Deliver login view
* ******************************** */
// controllers/accountController.js
const utilities = require("../utilities"); // adjust path as needed

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: null, // Initialize message to null
  })
}

module.exports = { buildLogin }