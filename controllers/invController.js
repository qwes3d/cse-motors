const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {};


const invCont = {}



invCont.buildManagementView = async function (req, res) {
  try {
    res.render("inventory/management", {
      title: "Inventory Management",
      message: req.flash("message"),
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    res.status(500).render("error", { error });
  }
};



/* ***************************
 *  Build inventory by classification view
 **************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 **************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  try {
    const vehicle = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()
    const html = utilities.buildVehicleDetail(vehicle)
    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle // Pass the vehicle object to the view
    
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont;

