const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

// Use the controller to render the EJS login view
router.get("/login", accountController.buildLogin);

module.exports = router;