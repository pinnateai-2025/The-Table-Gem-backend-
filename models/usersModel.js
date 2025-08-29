const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Name is required" },
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: { msg: "Invalid email format" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("customer", "admin"),
    defaultValue: "customer",
  },
  isVerified: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  resetToken: { 
    type: DataTypes.STRING,
    allowNull: true 
  },
  resetTokenExpiry: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  emailToken: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  emailTokenExpiry: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
});

// Hash password before save
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
