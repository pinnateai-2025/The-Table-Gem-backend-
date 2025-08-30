const express = require("express");
const morgan = require("morgan");
const sequelize = require("./config");
const authRoutes = require("./routes/authRoute");
const categoriesRoute = require("./routes/categoriesRoute");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoute);

sequelize.sync({ alter: true }).then(() => {
  console.log("Database connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
});
