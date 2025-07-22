const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

// Management view
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

// Classification view
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
};

// Detail view
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  try {
    const vehicle = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()
    const html = utilities.buildVehicleDetail(vehicle)
    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle
    })
  } catch (error) {
    next(error)
  }
};

// Add classification form
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

// Add classification handler
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const nav = await utilities.getNav();

  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("success", "New classification added successfully!");
      const updatedNav = await utilities.getNav(); 
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
      });
    } else {
      req.flash("error", "Failed to add classification. Try again.");
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error adding classification:", error.message);
    req.flash("error", "Server error. Please try again.");
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};


invCont.buildAddInventory = async function (req, res, next) {
  try {
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      classificationList,
      nav: await utilities.getNav(),
      errors: null
    });
  } catch (error) {
    next(error);
  }
}


invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });

    if (result) {
      req.flash("notice", "Vehicle successfully added.");
      res.redirect("/inv/management");
    } else {
      let classificationList = await utilities.buildClassificationList(classification_id);
      req.flash("error", "Failed to add vehicle.");
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        classificationList,
        nav: await utilities.getNav(),
        ...req.body,
      });
    }
  } catch (error) {
    next(error);
  }
}



module.exports = invCont;
