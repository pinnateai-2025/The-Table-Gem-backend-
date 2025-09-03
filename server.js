const express = require("express");
const morgan = require("morgan");
const sequelize = require("./config");
const route = require("./routes/index"); 
const { errorHandler } = require("./middlewares/errorMiddleware");
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", route);

app.use(errorHandler);

sequelize.sync({ alter: true }).then(() => {
  console.log("Database connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
});
