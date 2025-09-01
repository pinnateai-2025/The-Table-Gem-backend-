// models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const { applyAssociations } = require("../associations/association");
const sequelize = require("../config")

// Initialize db container
const db = {};

// Import all models
db.User = require("./usersModel")(sequelize, DataTypes);
db.Category = require("./categoriesModel")(sequelize, DataTypes);
db.Product = require("./productsModel")(sequelize, DataTypes);
db.Cart = require("./cartModel")(sequelize, DataTypes);
db.CartItem = require("./cartItemsModel")(sequelize, DataTypes);

// Apply associations
applyAssociations(db);

// Attach sequelize instance & class
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
