const pool = require("../database");

// Show user's ticket page
exports.getUserTickets = async (req, res) => {
  const account_id = req.session.account_id;
  console.log("Fetching tickets for account:", account_id);

  if (!account_id) return res.redirect("/account/login");

  try {
    const result = await pool.query(
      "SELECT * FROM support_ticket WHERE account_id = $1 ORDER BY created_at DESC",
      [account_id]
    );
    console.log("Tickets fetched:", result.rowCount);
    res.render("/support/my-tickets", { tickets: result.rows });
  } catch (err) {
    console.error("Error loading tickets:", err);
    res.status(500).send("Error loading tickets");
  }
};

// Submit a new complaint
exports.submitTicket = async (req, res) => {
  const account_id = req.session.account_id;
  if (!account_id) return res.redirect("/account/login");

  const message = req.body.message?.trim();
  if (!message) return res.status(400).send("Message cannot be empty.");

  try {
    await pool.query(
      "INSERT INTO support_ticket (account_id, message) VALUES ($1, $2)",
      [account_id, message]
    );
    res.redirect("/support/my-tickets");
  } catch (err) {
    console.error("Error submitting ticket:", err);
    res.status(500).send("Error submitting ticket");
  }
};
