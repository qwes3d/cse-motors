const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { validationResult } = require("express-validator");

const invCont = {};

// Management view
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      message: req.flash('message') || [],
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

// Classification view
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      message: req.flash('message') || [],
    });
  } catch (error) {
    next(error);
  }
};

// Detail view
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId);
    const vehicle = await invModel.getInventoryById(inv_id);
    const nav = await utilities.getNav();
    
    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      message: req.flash('message') || [],
    });
  } catch (error) {
    next(error);
  }
};

// Add classification form
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash('message') || [],
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// Add classification handler
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  
  try {
    const nav = await utilities.getNav();
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash('message') || [],
        errors: errors.array()
      });
    }

    const result = await invModel.addClassification(classification_name);
    
    if (result) {
      req.flash("message", "New classification added successfully!");
      res.redirect("/inv/management");
    } else {
      req.flash("message", "Failed to add classification. Try again.");
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Add inventory form
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: req.flash('message') || [],
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: ""
    });
  } catch (error) {
    next(error);
  }
};

// Add inventory handler
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);

    if (!errors.isEmpty()) {
      return res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationSelect,
        message: req.flash('message') || [],
        errors: errors.array(),
        ...req.body
      });
    }

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
      req.flash("message", "Vehicle successfully added.");
      res.redirect("/inv/management");
    } else {
      req.flash("message", "Failed to add vehicle.");
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationSelect,
        message: req.flash('message') || [],
        ...req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get inventory JSON
invCont.getInventoryJSON = async function(req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (data.length > 0) {
      return res.json(data);
    } else {
      return res.json([]);
    }
  } catch (error) {
    next(error);
  }
};



/* ***************************
 * Build Edit Inventory View
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inventory_id = parseInt(req.params.inventory_id);
    const nav = await utilities.getNav();
    
    // Get the vehicle data
    const vehicleData = await invModel.getInventoryById(inventory_id);
    
    // Get the classification list for the dropdown
    const classificationSelect = await utilities.buildClassificationList(vehicleData.classification_id);
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + vehicleData.inv_make + " " + vehicleData.inv_model,
      nav,
      classificationSelect,
      errors: null,
      inv_id: vehicleData.inv_id,
      inv_make: vehicleData.inv_make,
      inv_model: vehicleData.inv_model,
      inv_year: vehicleData.inv_year,
      inv_description: vehicleData.inv_description,
      inv_image: vehicleData.inv_image,
      inv_thumbnail: vehicleData.inv_thumbnail,
      inv_price: vehicleData.inv_price,
      inv_miles: vehicleData.inv_miles,
      inv_color: vehicleData.inv_color,
      classification_id: vehicleData.classification_id
    });
  } catch (error) {
    next(error);
  }
};



/* ***************************
 * Update Inventory Data
 * Handles form submission from edit-inventory view
 * ************************** */
invCont.updateInventory = async function(req, res, next) {
  try {
    const { inv_id, ...updatedData } = req.body;
    const currentData = await invModel.getInventoryById(inv_id);

    // Check if any data actually changed
    const changesDetected = Object.keys(updatedData).some(key => {
      return currentData[key] != updatedData[key]; // != for type coercion
    });

    if (!changesDetected) {
      req.flash("info", "No changes were made to the inventory item.");
      return res.redirect(`/inv/edit/${inv_id}`);
    }

    // Proceed with update if changes exist
    const updateResult = await invModel.updateInventory({
      inv_id: parseInt(inv_id),
      ...updatedData
    });

    if (updateResult) {
      req.flash("success", `Successfully updated ${updatedData.inv_make} ${updatedData.inv_model}`);
      return res.redirect("/inv/");
    }
    throw new Error("Update failed");
  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", "Failed to update inventory item.");
    return res.redirect(`/inv/edit/${req.body.inv_id}`);
  }
};




/* ***************************
 * Build Delete Confirmation View
 * Displays inventory item details for confirmation before deletion
 * ************************** */
invCont.buildDeleteConfirmation = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const vehicleData = await invModel.getInventoryById(inv_id);

    if (!vehicleData) {
      req.flash("error", "Inventory item not found");
      return res.redirect("/inv/");
    }

    const itemName = `${vehicleData.inv_make} ${vehicleData.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      inv_id: vehicleData.inv_id,
      inv_make: vehicleData.inv_make,
      inv_model: vehicleData.inv_model,
      inv_year: vehicleData.inv_year,
      inv_price: vehicleData.inv_price,
      inv_color: vehicleData.inv_color,
      inv_miles: vehicleData.inv_miles
    });
  } catch (error) {
    console.error("Delete confirmation error:", error);
    req.flash("error", "Error loading delete confirmation");
    res.redirect("/inv/");
  }
};

/* ***************************
 * Process Inventory Deletion
 * Handles permanent removal of inventory items
 * ************************** */
invCont.deleteInventory = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const nav = await utilities.getNav();

    // Verify CSRF token (if implemented)
    if (!req.body._csrf) {
      throw new Error("Invalid form submission");
    }

    // Get vehicle data for flash message
    const vehicleData = await invModel.getInventoryById(inv_id);
    if (!vehicleData) {
      req.flash("error", "Inventory item not found");
      return res.redirect("/inv/");
    }

    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
      req.flash("success", 
        `Successfully deleted ${vehicleData.inv_make} ${vehicleData.inv_model}`);
      return res.redirect("/inv/");
    } else {
      req.flash("error", 
        `Failed to delete ${vehicleData.inv_make} ${vehicleData.inv_model}`);
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Delete processing error:", error);
    req.flash("error", "An error occurred during deletion");
    return res.redirect(`/inv/delete/${req.body.inv_id}`);
  }
};

module.exports = invCont;