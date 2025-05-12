const express = require('express');
const router = express.Router();
const { loginAdmin, updateAdmin } = require('../controllers/authController');

// Routes
router.post('/login', loginAdmin);    // Admin login or first-time registration
router.patch('/update', updateAdmin); // Admin update route

module.exports = router;
