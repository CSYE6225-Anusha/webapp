const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', // This should match the name of your User model
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'upload_date',
  updatedAt: false,
});

// Export the Image model
module.exports = Image;
