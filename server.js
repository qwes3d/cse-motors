// Load environment variables
require('dotenv').config();

// Required modules
const cookieParser = require("cookie-parser")
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require("express-session");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const pool = require('./database/');
const baseController = require("./controllers/baseController");
const inventoryRoute = require('./routes/inventoryRoute');
const accountRoute = require('./routes/accountRoute');
const utilities = require("./utilities");
const bodyParser = require("body-parser");


// Initialize Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', './layouts/layout'); // Layout path

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(cookieParser())
// 
app.use(express.static('public'))


// Session middleware (must come before flash)
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Flash middleware
app.use(flash());

// Custom middleware to pass flash messages to views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

// Optional: Use express-messages if you're using its helpers in EJS
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Routes
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

// 
app.use("/inventory", inventoryRoute);

app.get('/services', (req, res) => {
  res.send('Services Page (Coming Soon)');
});
app.get('/contact', (req, res) => {
  res.send('Contact Page (Coming Soon)');
});

// 404 handler
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
  console.log(`✅ CSE Motors server running at http://localhost:${PORT}`);
});
