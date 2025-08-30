const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Category name is required" },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Category;
