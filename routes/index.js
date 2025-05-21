const express = require('express');
const router = express.Router();

// Import route modules
const charlesRoutes = require('./charles.routes');

// Use route modules
router.use('/charles', charlesRoutes);

module.exports = router; 