const express = require("express");
const Admin = require("../models/user");
const { compareHash } = require("../services/hash");

const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).exec();
    if (admin) {
      if (admin.emailverified) {
        const result = await compareHash(password, admin.passwordHash);
        if (result) {
          res.status(200).json({
            status: "SUCCESS"
          });
        } else {
          res.status(401).json({ status: "invaliduser" });
        }
      } else {
        res.status(403).send({ status: "User not verified" });
      }
    } else {
      res.status(401).json({ status: "invaliduser" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = loginRouter;
