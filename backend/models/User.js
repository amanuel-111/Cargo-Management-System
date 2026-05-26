const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class User extends Model {
  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  getSignedJwtToken() {
    return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  getRefreshToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
  }

  getEmailVerificationToken() {
    const token = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return token;
  }

  getResetPasswordToken() {
    const token = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    return token;
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refreshToken;
    return values;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('customer', 'driver', 'fleet_manager', 'admin'),
      defaultValue: 'customer',
    },
    avatar: { type: DataTypes.STRING(500), defaultValue: '' },
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING(255), allowNull: true },
    emailVerificationExpire: { type: DataTypes.DATE, allowNull: true },
    resetPasswordToken: { type: DataTypes.STRING(255), allowNull: true },
    resetPasswordExpire: { type: DataTypes.DATE, allowNull: true },
    fcmToken: { type: DataTypes.STRING(500), defaultValue: '' },
    // Address (flattened)
    addressStreet: { type: DataTypes.STRING(255), allowNull: true },
    addressCity: { type: DataTypes.STRING(100), allowNull: true },
    addressRegion: { type: DataTypes.STRING(100), allowNull: true },
    addressCountry: { type: DataTypes.STRING(100), defaultValue: 'Ethiopia' },
    // Driver fields
    licenseNumber: { type: DataTypes.STRING(100), allowNull: true },
    licenseExpiry: { type: DataTypes.DATE, allowNull: true },
    vehicleAssignedId: { type: DataTypes.INTEGER, allowNull: true },
    currentLat: { type: DataTypes.DECIMAL(10, 8), defaultValue: 0 },
    currentLng: { type: DataTypes.DECIMAL(11, 8), defaultValue: 0 },
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    totalDeliveries: { type: DataTypes.INTEGER, defaultValue: 0 },
    earnings: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    lastSeen: { type: DataTypes.DATE, allowNull: true },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;
