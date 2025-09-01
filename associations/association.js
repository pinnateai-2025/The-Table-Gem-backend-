// associations/association.js
const applyAssociations = (db) => {
  const { User, Product, Category, Cart, CartItem } = db;

  // User ↔ Cart
  User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  // Cart ↔ CartItem
  Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });

  // Product ↔ CartItem
  Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });
  CartItem.belongsTo(Product, { foreignKey: "productId" });

  // Category ↔ Product
  Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  // User ↔ Product
  User.hasMany(Product, { foreignKey: "createdBy", as: "createdProducts" });
  Product.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
};

module.exports = { applyAssociations };
