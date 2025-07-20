const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route for classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route for detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildVehicleDetail))

// Your routes here
router.get("/", (req, res) => {
  res.send("Inventory home page");
});


router.get("/cause-error", (req, res) => {
  throw new Error("Intentional server error for testing.")
})



module.exports = router
