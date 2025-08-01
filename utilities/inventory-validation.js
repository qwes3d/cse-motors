// utilities/inventory-validation.js

const { body, validationResult } = require("express-validator");
const utilities = require("./index"); // assuming index.js exports getNav & buildClassificationList

// Validation rules for adding inventory
const inventoryRules = () => [
  body("inv_make").notEmpty().withMessage("Make is required."),
  body("inv_model").notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Valid year is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative number."),
  body("inv_description").notEmpty().withMessage("Description is required."),
  body("inv_image").notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").notEmpty().withMessage("Thumbnail path is required."),
  body("inv_color").notEmpty().withMessage("Color is required."),
];

// Middleware to check inventory validation result
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList(req.body.classification_id);

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body,
    });
  }
  next();
};


/* ***************************
 * Validate Inventory Update Data
 * On error, returns to edit view with error messages
 * ************************** */
const checkUpdateData = async (req, res, next) => {
  const { 
    inv_id, classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail, inv_price,
    inv_miles, inv_color
  } = req.body;
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList(classification_id);
    
    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
  next();
};



// Validation rules for classification
const classificationRules = () => [
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("No spaces or special characters allowed."),
];

// Middleware to check classification validation result
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
    });
  }
  next();
};

// Export all validation middleware
module.exports = {
  inventoryRules,
  checkInventoryData,
  classificationRules,
  checkClassificationData,
  checkUpdateData,
};
