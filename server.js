// Load required modules
const express = require('express');
const path = require('path');

const baseController = require("./controllers/baseController")

// Initialize the Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the folder where your EJS files (views) are located
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Home Route - render index.ejs
app.get('/', baseController.buildHome);

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CSE Motors server is running at http://localhost:${PORT}`);
});

// live. URL https://cse-motors-qboi.onrender.com