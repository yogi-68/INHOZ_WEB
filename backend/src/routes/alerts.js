const express = require('express');
const router = express.Router();

// Get alerts
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const alerts = await db.collection('alerts')
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;
