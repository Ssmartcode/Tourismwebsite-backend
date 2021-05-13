const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

require("dotenv").config();

const app = express();

// body parser
app.use(express.json());

// static files
app.use("/uploads/images", express.static(path.join("uploads", "images")));

// mongoose connection
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const connection = mongoose.connection;
connection.once("connected", () => console.log("connected to the data base"));
connection.on("error", () => console.log("Could not connect to the data base"));

// set headers
app.use(cors());

// users route
app.use("/users", require("./routers/users"));
// offers route
app.use("/offers", require("./routers/offers"));

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "Welcome to the website" });
});

app.use((err, req, res, next) => {
  console.log(err);
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.sentHeaders) {
    next(err);
  }
  res.status(err.code || 500).json({ message: err.message });
});

app.listen(process.env.PORT, () =>
  console.log("Connected on port " + process.env.PORT)
);
