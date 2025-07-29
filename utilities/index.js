const jwt = require("jsonwebtoken")
require("dotenv").config()

const pool = require("../database") // or correct relative path to your db setup


const invModel = require("../models/inventory-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul class="nav-menu">'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}





/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<ul class="nav-menu">'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }


Util.buildVehicleDetail = function (vehicle) {
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> $${vehicle.inv_price.toLocaleString()}</p>
        <p><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString()} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `
}


Util.handleErrors = function (fn) {
  return function (req, res, next) {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
}


function getNav() {
  let nav = `
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/inventory">Inventory</a></li>
      <li><a href="/account/login">My Account</a></li>
    </ul>
  `;
  return nav;
}

Util.getNav = getNav;

async function getNav() {
  const data = await pool.query("SELECT * FROM classification ORDER BY classification_name");
  let nav = '<ul>';
  nav += `<li><a href="/" title="Home page">Home</a></li>`;
  data.rows.forEach((row) => {
    nav += `<li><a href="/inv/type/${row.classification_id}" title="See our ${row.classification_name} line">${row.classification_name}</a></li>`;
  });
  nav += "</ul>";
  return nav;
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    req.flash("notice", "Please log in to access this page");
    return res.redirect("/account/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("jwt");
      req.flash("notice", "Session expired - please log in again");
      return res.redirect("/account/login");
    }
    
    res.locals.accountData = decoded;
    res.locals.loggedin = true;
    next();
  });
};



/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next() // User is logged in, continue to the requested route
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login") // Redirect to login page
  }
}





module.exports = Util
