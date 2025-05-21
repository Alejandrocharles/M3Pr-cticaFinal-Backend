const express = require('express');
const router = express.Router();
const charlesController = require('../controllers/charles.controller');

// Auth routes
router.post('/register', charlesController.register);
router.post('/login', charlesController.login);

// CRUD routes
router.get('/', charlesController.findAll);
router.get('/:id', charlesController.findOne);
router.put('/:id', charlesController.update);
router.delete('/:id', charlesController.delete);

module.exports = router; 