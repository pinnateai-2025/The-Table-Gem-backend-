module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("initiated", "successful", "failed", "refunded"),
      defaultValue: "initiated",
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Payment;
};
