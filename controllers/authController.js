const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

const createTokenAndRes = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    Expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'productions') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(user, url).sendWelcome();
  createTokenAndRes(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if an email and password was provided.
  if (!email || !password)
    return next(new AppError('Please provide a password & email.', 400));
  //2) Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPasswords(password, user.password)))
    return next(new AppError('incorrect email or password', 401));
  //3) If everything is ok, send token to client
  createTokenAndRes(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get token and check if it exists.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError('You are not logged in please log in to get access.', 401),
    );

  //2) Verify token - promisefying jwt.verify as it runs callback option and not a promise so we can still issue errors to our error handlers
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );

  //4) Check if user changed password after token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat))
    next(
      new AppError(
        'The user recently changed the password. Please log in again.',
        401,
      ),
    );
  //grant access to the next route handler which provides the data
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with that email address'), 404);
  //2. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3. Send it to users email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error in sending the email. Please try again later.',
      ),
      500,
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token has not expired, and there is a user, set new pw
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt property for the user

  //4)log the user in, send JWT
  createTokenAndRes(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2. check current POSTed password is correct
  if (!(await user.correctPasswords(req.body.password, user.password))) {
    return next(new AppError('your current password is wrong'), 401);
  }
  //3. if so, update password
  user.password = req.body.updatePassword;
  user.passwordConfirm = req.body.confirmUpdatePassword;
  await user.save();
  //findByIdAndUpdate will not work as intended!
  //4. log user in, sent JWT to client
  createTokenAndRes(user, 201, res);
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      //3) Check if user changed password after token was issued.
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      //User is logged in, make available to templates
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      //No logged in user (invalid/expired token)
      return next();
    }
  }
  next();
};

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expire: new Date(Date.now() * 10 * 5000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
