/*  Deliver login view
* ******************************** */
// controllers/accountController.js
const utilities = require("../utilities"); // adjust path as needed

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
  title: "Register",
  nav,
  message: req.flash("message") || null, // Add this line
});
}

module.exports = { 
  buildLogin, 
  buildRegister 
}

