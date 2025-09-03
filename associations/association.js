const applyAssociations = (db) => {
  const { User, Product, Category, Cart, CartItem, Order, OrderItem } = db;

  // ================= USER ↔ CART =================
  User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE", as: "cart" });
  Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

  // ================= CART ↔ CARTITEM =================
  Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE", as: "items" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

  // ================= PRODUCT ↔ CARTITEM =================
  Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE", as: "cartItems" });
  CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ================= CATEGORY ↔ PRODUCT =================
  Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  // ================= USER ↔ PRODUCT =================
  User.hasMany(Product, { foreignKey: "createdBy", as: "createdProducts" });
  Product.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

  // ================= USER ↔ ORDER =================
  User.hasMany(Order, { foreignKey: "userId", as: "orders" });
  Order.belongsTo(User, { foreignKey: "userId", as: "user" });

  // ================= ORDER ↔ ORDERITEM =================
  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  // ================= PRODUCT ↔ ORDERITEM =================
  Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
  OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
};

module.exports = { applyAssociations };
