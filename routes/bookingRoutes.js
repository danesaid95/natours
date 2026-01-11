const express = require('express');
const bookController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/checkout-session/:tourId')
  .get(authController.protect, bookController.getCheckOutSession);

// router
//   .route('/')
//   .post(authController.protect, bookController.createBookingCheckout);

module.exports = router;
