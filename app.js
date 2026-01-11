const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// 1) Global MIDDLEWARE
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// //to server static pages
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//setting security http headers
// Configure CSP to allow Mapbox and other external resources we use
//setting security http headers
// Temporarily disable Helmet's contentSecurityPolicy to rule out CSP blocking map tiles/styles.
// If this fixes the map, we should add a minimal CSP allowing Mapbox domains instead of disabling it.
app.use(helmet({ contentSecurityPolicy: false }));

//logging routes accessed
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//request body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data santization against NOSQL injections
app.use(mongoSanitize());

//Data santization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'difficulty',
      'price',
      'maxGroupSize  ',
    ],
  }),
);

//rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});

//rate limits on this route
app.use('/api', limiter);

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

//Middleware test
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//2) Routes mounting

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;
