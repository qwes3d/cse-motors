// inventoryRoute.js

const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validate = require("../utilities/inventory-validation");
const authMiddleware = require('../middleware/authMiddleware');



// Management view route
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildVehicleDetail))

/* ***************************
 * Deliver Edit Inventory View
 * ************************** */
router.get("/edit/:inv_id", 
  utilities.handleErrors(invController.buildEditInventory));

router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON));

// Add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Handle inventory submission
router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Render add classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Handle classification submission
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)



/* ***************************
 * Process Inventory Update
 * ************************** */
router.post("/update",
  validate.inventoryRules(),
  validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory));


  /* ***************************
 * Deliver Delete Confirmation View
 * ************************** */
router.get("/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteConfirmation));

/* ***************************
 * Process Inventory Deletion
 * ************************** */
router.post("/delete",
  utilities.handleErrors(invController.deleteInventory));


// Protected routes (require Employee/Admin)
router.get("/", authMiddleware(), invController.buildManagementView);
router.get("/add-classification", authMiddleware(), invController.buildAddClassification);
router.post("/add-classification", authMiddleware(), invController.addClassification);




// Route to simulate error
router.get("/cause-error", (req, res) => {
  throw new Error("Intentional server error for testing.")
})

module.exports = router
