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
      model: 'Users',
      key: 'id'
    }
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
      isDate: true,
    },
  },
}, {
  timestamps: true,
  createdAt: 'upload_date',
  updatedAt: false,
  hooks: {
    beforeCreate: (image) => {
      // Set upload_date to only the date part
      image.upload_date = new Date().toISOString().split('T')[0];
    }
  }
});

// Export the Image model
module.exports = Image;
