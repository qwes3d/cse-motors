const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const validate = {};

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email already exists. Please log in or use a different email");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol."),
  ];
};

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ];
};

/* **********************************
 * Account Update Validation Rules
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
  ];
};

/* **********************************
 * Password Change Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Current password is required."),

    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("New password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol."),

    body("confirm_password")
      .trim()
      .notEmpty()
      .withMessage("Please confirm your password.")
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
  ];
};

/* **********************************
 * Check Registration Data
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  console.log("Checking registration data...");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors found:", errors.array());
    // If there are validation errors, render the registration page with errors
    let nav = await utilities.getNav();
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      messages: req.flash(), // Use 'messages' to access flash messages
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    });
  }
  console.log("No validation errors, proceeding to next middleware...");
  // If no validation errors, proceed to the next middleware
  next();
};


/* **********************************
 * Check Login Data
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors found:", errors.array());
    errors.array().forEach(error => {
      req.flash('error', error.msg);
    });
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      messages: req.flash(), // Use 'messages' to access flash messages
      errors: null, // Set errors to null to avoid rendering errors in the view
      account_email: req.body.account_email
    });
  }
  next();
};

/* **********************************
 * Check Update Data
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors found:", errors.array());
    errors.array().forEach(error => {
      req.flash('error', error.msg);
    });

    let nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account",
      nav,
      messages: req.flash(), // Use 'messages' to access flash messages
      errors: null,
      accountData: req.body
    });
  }
  next();
};

/* **********************************
 * Check Password Data
 * ********************************* */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors found:", errors.array());
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(req.params.account_id);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData,
      passwordErrors: true
    });
  }
  next();
};

/* **********************************
 * Authentication Check Middleware
 * ********************************* */
validate.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    req.flash("notice", "Please log in to access this page");
    return res.status(401).redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.account = {
      account_id: decoded.account_id,
      account_firstname: decoded.account_firstname,
      account_email: decoded.account_email,
      account_type: decoded.account_type
    };
    res.locals.account = req.account;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.clearCookie("jwt");
    req.flash("notice", "Session expired. Please log in again");
    return res.status(401).redirect("/account/login");
  }
};

module.exports = validate;