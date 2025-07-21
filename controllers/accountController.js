const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model"); // assuming your model is here

/* ******************************
 * Deliver login view
 ****************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    message: null,
  });
}

/* ******************************
 * Deliver registration view
 ****************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    message: null,
    errors: null,
  });
}

/* ******************************
 * Handle registration POST
 ****************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  let hashedPassword;
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: null,
      errors: null,
    });
  }

  // Call the model to register
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      message: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      message: null,
      errors: null,
    });
  }
}

/* ******************************
 * Handle login POST
 ****************************** */
async function login(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "No account found with that email.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      message: null,
    });
  }

  const isPasswordMatch = bcrypt.compareSync(account_password, accountData.account_password);

  if (!isPasswordMatch) {
    req.flash("notice", "Incorrect password.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      message: null,
    });
  }

  // Store session info (optional: setup JWT or session later)
  req.session.account = {
    id: accountData.account_id,
    name: `${accountData.account_firstname} ${accountData.account_lastname}`,
    email: accountData.account_email,
    type: accountData.account_type,
  };

  req.flash("notice", `Welcome back, ${accountData.account_firstname}.`);
  res.redirect("/account/");
}

// ✅ Export everything correctly
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  login,
};
