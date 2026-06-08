const express = require('express');
const router = express.Router();
const { createRegistrationOrder } = require('../controllers/payment.controller');

router.post('/create-registration-order', createRegistrationOrder);

module.exports = router;
