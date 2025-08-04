const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ======= Render Login View ======= */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null, // Initialize errors to null
    messages: req.flash() // Changed to 'messages' to match common practice
  });
}


/* ======= Process Login ======= */
async function accountLogin(req, res, next) {
  try {
    const { account_email, account_password } = req.body;
    
    // Check if account exists
    const account = await accountModel.getAccountByEmail(account_email);
    if (!account) {
      req.flash('error', 'Invalid email');
      return res.redirect('/account/login');
    }

    // Verify password
    const isMatch = await bcrypt.compare(account_password, account.account_password);
    if (!isMatch) {
      req.flash('error', 'Invalid password');
      return res.redirect('/account/login');
    }

    // Create JWT token
    const token = jwt.sign(
      {
        account_id: account.account_id,
        account_firstname: account.account_firstname,
        account_email: account.account_email,
        account_type: account.account_type
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie and redirect
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour in milliseconds
    });
    req.flash('success', 'Login successful!');
    return res.redirect('/account/management');
  } catch (error) {
    next(error);
  }
}



/* ======= Render Register View ======= */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null, // Initialize errors to null
    messages: req.flash() // Changed to 'messages'
  });
}



/* ======= Register New Account ======= */
async function registerAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    
     if (!account_password) {
      req.flash('error', 'Password is required');
      return res.redirect("/account/register");
    }

    // Hash the password before storing
    const hashed_Password = await bcrypt.hash(account_password, 10);
    
    // Create the account
    const result = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashed_Password
    );

    if (result) {
      // Create JWT token
      const token = jwt.sign(
        {
          account_id: result.account_id,
          account_firstname: result.account_firstname,
          account_email: result.account_email,
          account_type: 'Client'
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Set cookie and redirect
      res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });
      req.flash('success', 'Registration successful!');
      return res.redirect("/account/management");
    } else {
      req.flash('error', 'Registration failed. Please try again.');
      return res.redirect("/account/register");
    }
  }  catch (error) {
    if (error.code === '23505') { // PostgreSQL unique_violation
      req.flash("error", "Email is already in use.");
      return res.redirect("/account/register");
    }
    next(error);
  }
}



/* ======= Render Account Management View ======= */
async function buildAccountManagement(req, res, next) {
  try {
    console.log("Account from JWT:", req.account); // ✅ Add this to inspect

    const nav = await utilities.getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      success_msg: req.flash("success"),
      error_msg: req.flash("error"),
    });
  } catch (error) {
    next(error);
  }
}



/* ======= Build Account Update View ======= */
async function buildUpdateAccount(req, res, next) {
  try {
    const account_id = req.account.account_id; // Get from authenticated user
    const accountData = await accountModel.getAccountById(account_id);

    res.render("account/update", {
      title: "Update Account",
      nav: await utilities.getNav(),
      accountData,
      messages: req.flash(),
      errors: null // Initialize errors to nullo
    });
  } catch (error) {
    next(error);
  }
}

/* ======= Process Account Update ======= */
async function updateAccount(req, res, next) {
  try {
    const account_id = req.account.account_id; // Get from authenticated user
    const { account_firstname, account_lastname, account_email } = req.body;

    // Check if email is being changed to one that already exists
    const currentAccount = await accountModel.getAccountById(account_id);
    
    if (currentAccount.account_email !== account_email) {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        req.flash('error', 'Email already in use');
        return res.redirect('/account/update');
      }
    }

    const updateResult = await accountModel.updateAccount({
      account_id,
      account_firstname,
      account_lastname,
      account_email
    });

    if (updateResult) {
      // Update JWT with new info
      const token = jwt.sign(
        {
          account_id,
          account_firstname,
          account_email,
          account_type: req.account.account_type
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });
      
      req.flash("success", "Account updated successfully");
      return res.redirect("/account/management");
    }
    throw new Error("Update failed");
  } catch (error) {
    req.flash("error", "Failed to update account");
    return res.redirect('/account/update');
  }
}

/* ======= Process Password Change ======= */
async function updatePassword(req, res, next) {
  try {
    const account_id = req.account.account_id; // Get from authenticated user
    const { current_password, new_password } = req.body;

    // Verify current password
    const account = await accountModel.getAccountById(account_id);
    const isMatch = await bcrypt.compare(current_password, account.account_password);
    
    if (!isMatch) {
      req.flash('error', 'Password must be at least 12 characters,one UPPERCASE,one number and special character');
      return res.redirect('/account/update');
    }

    // Hash new password
    const hashed_Password = await bcrypt.hash(new_password, 10);

    const updateResult = await accountModel.updatePassword(
      account_id,
      hashed_Password
    );

    if (updateResult) {
      req.flash("success", "Password updated successfully");
      return res.redirect("./account/management");
    }
    throw new Error("Password update failed");
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect('./account/update');
  }
}

/* ======= Logout ======= */
async function accountLogout(req, res) {
  res.clearCookie('jwt');
  req.flash('success', 'You have been logged out');
  return res.redirect('/');
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  accountLogout,
  updatePassword,
  buildUpdateAccount,
  updateAccount,

};