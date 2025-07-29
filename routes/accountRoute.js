const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const validate = require("../utilities/account-validation");
const utilities = require("../utilities");
const authMiddleware = require("../middleware/authMiddleware");

// ========== PUBLIC ROUTES ========== //
// Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration View
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process Registration
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process Login
router.post(
  "/account/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// ========== PROTECTED ROUTES ========== //
// Account Management View
router.get("/management",
  authMiddleware(['Client', 'Employee', 'Admin']),
  utilities.handleErrors(accountController.buildAccountManagement)
);
// Add POST route for account management form submissions
router.post('/management', accountController.updateAccount);


// Account Update View
router.get("/update",
  authMiddleware(['Client', 'Employee', 'Admin']),
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process Account Update
router.post("/update",
  authMiddleware(['Client', 'Employee', 'Admin']),
  validate.updateRules(),
  validate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process Password Change
router.post("/update-password",
  authMiddleware(['Client', 'Employee', 'Admin']),
  validate.passwordRules(),
  validate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Logout
router.get("/logout",
  authMiddleware(['Client', 'Employee', 'Admin']),
  utilities.handleErrors(accountController.accountLogout)
);

module.exports = router;