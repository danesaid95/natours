const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get All Tour Data
  const tours = await Tour.find();
  //2) Build template
  tours.forEach((el) => {
    const rawDate = el.startDates[0];
    el.formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });
  //3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get All Tour Data
  const [tour] = await Tour.find({ slug: req.params.slug }).populate('reviews');
  if (!tour) return next(new AppError('there is no tour with that name', 404));

  //2) Build template
  const description = tour.description.split('.');

  //3) Render that template using tour data from 1)
  res.status(200).render('tour', {
    title: tour.name,
    tour,
    description,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Log into your account' });
});

exports.account = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
    user: req.user,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { email: req.body.email, name: req.body.name },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings for current user
  const bookings = await Booking.find({ user: req.user.id });

  // Get tour IDs from bookings (tour is populated, so extract _id)
  const tourIDs = bookings.map((el) => el.tour._id);

  // Find tours with those IDs
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My bookings',
    tours,
  });
});
