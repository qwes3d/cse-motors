const express = require("express");
const router = express.Router();
const pool = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

// GET: Display user's support tickets
router.get('/support/my-tickets', authMiddleware(['Client']), async (req, res) => {
  const account_id = req.user.account_id; // ✅ FROM JWT
  const result = await pool.query(
    'SELECT * FROM support_ticket WHERE account_id = $1 ORDER BY created_at DESC',
    [account_id]
  );
  res.render('my-tickets', { tickets: result.rows });
});

router.post('/support/my-tickets', authMiddleware(['Client']), async (req, res) => {
  const account_id = req.user.account_id; // ✅ FROM JWT
  const { subject, message } = req.body;
  await pool.query(
    'INSERT INTO support_ticket (account_id, subject, message, status) VALUES ($1, $2, $3, $4)',
    [account_id, subject, message, 'Pending']
  );
  res.redirect('/support/my-tickets');
});

module.exports = router;