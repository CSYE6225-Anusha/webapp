const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const { v4: uuidv4 } = require('uuid');

const Email = sequelize.define("Email", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "pending",
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  createdAt: 'email_created',
});

module.exports = Email;
