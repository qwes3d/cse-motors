const { body, validationResult } = require("express-validator");
const utilities = require("./");

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("No spaces or special characters allowed."),
  ];
};

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

module.exports = { classificationRules, checkClassificationData };
