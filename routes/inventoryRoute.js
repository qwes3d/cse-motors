const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require("../utilities/inventory-validation") // ✅ Add correct path to your validation logic

// Management view route
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route for classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route for detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildVehicleDetail))

router.get("/add-inventory", invController.buildAddInventory);


router.post("/add-inventory", invController.addInventory);

// Render the add classification form
router.get("/add-classification", invController.buildAddClassification)

// Handle form submission
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassificationData,
  invController.addClassification
)

// Route to simulate an error (for testing error handlers)
router.get("/cause-error", (req, res) => {
  throw new Error("Intentional server error for testing.")
})

module.exports = router
