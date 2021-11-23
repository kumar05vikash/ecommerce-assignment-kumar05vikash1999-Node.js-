const express = require("express");
const ErrorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(logger("dev"));
// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

// Middleware
app.use(ErrorMiddleware);
module.exports = app;
