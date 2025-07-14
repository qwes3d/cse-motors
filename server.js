// Load required modules
const express = require('express');
const path = require('path');

const baseController = require("./controllers/baseController");

const inventoryRoute = require('./routes/inventoryRoute');

const utilities = require("./utilities")

// Initialize the Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the folder where your EJS files (views) are located
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Home Route - render index.ejs
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)
// About Route - render about.ejs

// Optional: Additional routes (you can create these pages later)
app.get('/inventory', (req, res) => {
  res.send('Inventory Page (Coming Soon)');
});

app.get('/services', (req, res) => {
  res.send('Services Page (Coming Soon)');
});

app.get('/contact', (req, res) => {
  res.send('Contact Page (Coming Soon)');
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  })
})



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CSE Motors server is running at http://localhost:${PORT}`);
});

// live. URL https://cse-motors-qboi.onrender.com