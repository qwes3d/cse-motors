const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav()

  res.render("index", {
    title: "Home",
    nav,
    bodyClass: "home" // 👈 Add this line
  })
}

module.exports = baseController
