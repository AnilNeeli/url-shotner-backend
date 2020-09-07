require('dotenv').config()
require("./dbconfig/db.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const Signuprouter = require("./controllers/signup");
const loginrouter = require("./controllers/login");
const resetpassword = require("./controllers/Resetpassword");
const Url = require("./controllers/Url");
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>authentication API Server!</h1>");
});

app.use("/signup", Signuprouter);
app.use("/login", loginrouter);
app.use("/resetpassword", resetpassword);
app.use("/Url", Url);
app.listen(process.env.PORT||8080, () => {
  console.log("Server started");
});
