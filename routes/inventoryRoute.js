const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invCont = require("../controllers/invController")



// Management view route
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
)


// Route for classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId))

// Route for detail view
router.get("/detail/:invId", utilities.handleErrors(invCont.buildVehicleDetail))

// Your routes here
router.get("/", (req, res) => {
  res.send("Inventory home page");
});


router.get("/cause-error", (req, res) => {
  throw new Error("Intentional server error for testing.")
})



module.exports = router
