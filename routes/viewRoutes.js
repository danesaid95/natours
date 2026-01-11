const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookingController');

const router = express.Router();

router.get('/login', authController.isLoggedIn, viewController.login);
router.get(
  '/',
  authController.isLoggedIn,
  bookController.createBookingCheckout,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/me', authController.protect, viewController.account);
router.get('/my-tour', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = router;
