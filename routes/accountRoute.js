const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

// Use the controller to render the login view;
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post('/register', utilities.handleErrors(accountController.registerAccount));


module.exports = router;