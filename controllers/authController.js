/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const SendEmail = require('./../utils/email');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions)
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  })
}


exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name: name,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
    role: role
  });
  const verifyToken = newUser.createEmailVerifyToken()
  await newUser.save({ validateBeforeSave: false })
  newUser.verificationToken = undefined;
  newUser.verificationExpires = undefined;
  const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/users/verifyEmail/${verifyToken}`

  const html = `
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <!-- Header -->
        <tr>
          <td bgcolor="#f7f7f7" style="padding: 20px 0; text-align: center;">
            <h1 style="color: #333333;">Email Verification</h1>
          </td>
        </tr>
        <!-- Email Content -->
        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #666666;">
              Verify your email address by clicking the link below:
            </p>
            <!-- Verify Button -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="border-radius: 3px; background: #007bff; text-align: center;">
                  <a href="${verifyURL}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 24px;">Verify Email</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td bgcolor="#f7f7f7" style="padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #999999;">This is an automated message. Please do not reply.</p>
          </td>
        </tr>
      </table>
    
    </body>
    </html>`;


  try {
    await SendEmail({
      email: newUser.email,
      subject: 'Verify your email address',
      html
    })
    res.status(200).json({
      status: 'success',
      message: 'A verification email has been sent to your email address.'
    })

  } catch (err) {
    newUser.verificationToken = undefined;
    await newUser.save({ validateBeforeSave: false })
    return next(new AppError('There was an error sending the email. Try again later!'), 500)
  }
  // createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (user.verificationStatus !== 'verified') return next(new AppError('Please verify your email address', 401))

  // const correct = await user.correctPassword(password, user.password);
  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401))
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401))
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401))
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next();
  }
}

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ verificationToken: hashedToken, verificationExpires: { $gt: Date.now() } })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  user.verificationStatus = 'verified';
  await user.save({ validateBeforeSave: false })
  user.verificationStatus = undefined;
  createSendToken(user, 200, res);

})

exports.resendVerifyEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404))
  }
  const verifyToken = user.createEmailVerifyToken()
  await user.save({ validateBeforeSave: false })
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/users/verifyEmail/${verifyToken}`
  const html = `
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <!-- Header -->
        <tr>
          <td bgcolor="#f7f7f7" style="padding: 20px 0; text-align: center;">
            <h1 style="color: #333333;">Email Verification</h1>
          </td>
        </tr>
        <!-- Email Content -->
        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #666666;">
              Verify your email address by clicking the link below:
            </p>
            <!-- Verify Button -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="border-radius: 3px; background: #007bff; text-align: center;">
                  <a href="${verifyURL}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 24px;">Verify Email</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td bgcolor="#f7f7f7" style="padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #999999;">This is an automated message. Please do not reply.</p>
          </td>
        </tr>
      </table>
    
    </body>
    </html>`;
  try {
    await SendEmail({
      email: user.email,
      subject: 'Verify your email address',
      html
    })
    res.status(200).json({
      status: 'success',
      message: 'A verification email has been sent to your email address.'
    })

  } catch (err) {
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false })
    return next(new AppError('There was an error sending the email. Try again later!'), 500)
  }

})


exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404))
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await SendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false })
    return next(new AppError('There was an error sending the email. Try again later!'), 500)
  }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 ) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

  //2 ) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined
  await user.save();

  //3 ) Update changedPasswordAt property for the user

  //4 ) Log the user in, send JWT
  createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync(async (req, res, next) => {

  // 1) Get user from collection
  const { passwordCurrent, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!await user.correctPassword(passwordCurrent, user.password)) {
    return next(new AppError('Your current password is wrong.', 401))
  }
  // 3) If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
})