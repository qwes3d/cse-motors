// Load environment variables
require('dotenv').config();

// Required modules
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const baseController = require("./controllers/baseController");
const inventoryRoute = require('./routes/inventoryRoute');
const utilities = require("./utilities");

// Initialize Express app
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts); // Enable express-ejs-layouts

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', './layouts/layout'); // Use views/layouts/layout.ejs as the layout

// Routes
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);

app.get('/inventory', (req, res) => {
  res.send('Inventory Page (Coming Soon)');
});

app.get('/services', (req, res) => {
  res.send('Services Page (Coming Soon)');
});

app.get('/contact', (req, res) => {
  res.send('Contact Page (Coming Soon)');
});

// 404 Not Found handler
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// General error handler
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CSE Motors server running at http://localhost:${PORT}`);
});
