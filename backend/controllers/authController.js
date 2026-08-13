const crypto = require('crypto');
const { User } = require('../models');
const emailService = require('../services/emailService');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();
  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const allowedRoles = ['customer', 'driver'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({ firstName, lastName, email, phone, password, role: userRole });

    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    try {
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      await emailService.sendVerificationEmail(user.email, user.firstName, verifyUrl);
    } catch (e) {
      console.error('Verification email failed:', e.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated' });

    await user.update({ isOnline: true, lastSeen: new Date() });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: req.user.id } });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      where: { emailVerificationToken: hashedToken },
    });

    if (!user || new Date(user.emailVerificationExpire) < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    await user.update({ isEmailVerified: true, emailVerificationToken: null, emailVerificationExpire: null });
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    // Always return the same response to prevent user enumeration
    const successMsg = { success: true, message: 'If that email is registered, a password reset link has been sent' };

    if (!user) return res.status(200).json(successMsg);

    const resetToken = user.getResetPasswordToken();
    await user.save();

    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await emailService.sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    } catch (e) {
      // Clear the token if email fails
      await user.update({ resetPasswordToken: null, resetPasswordExpire: null });
      console.error('Password reset email failed:', e.message);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
    }

    res.status(200).json(successMsg);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

    if (!user || new Date(user.resetPasswordExpire) < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    await user.update({ password: req.body.password, resetPasswordToken: null, resetPasswordExpire: null });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    await user.update({ password: req.body.newPassword });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    const token = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();
    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

