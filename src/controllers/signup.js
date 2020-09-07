const express = require("express");
require("../dbconfig/db");
const Admin = require("../models/user");
const SignupRouter = express.Router();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");
const { generateHash } = require("../services/hash");
const { TokenGenerator } = require("../services/JWT");
const { validateToken } = require("../services/JWT");
SignupRouter.post("/", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const admin = await Admin.findOne({ email }).exec();

  if (admin) {
    res.status(503).json({ status: "user already registered" });
  } else {
    try {
      const result = await new Admin({
        firstname: firstname,
        lastname: lastname,
        email: email,
        passwordHash: await generateHash(password),
        emailverified: false
      }).save();
      const jwtToken = TokenGenerator(email);
      const url = `https://url-shornter-anil.netlify.app/Confirmation/${jwtToken}`;
      const oauth2Client = new OAuth2(
        "682804697180-rvn5k7h139t0u3r3h0l5fobgljepnlg5.apps.googleusercontent.com",
        "cBFZzoJwFuZmexb6RTKKv357", // Client Secret
        "https://developers.google.com/oauthplayground" // Redirect URL
      );
      oauth2Client.setCredentials({
        refresh_token:
          "1//04Bxo8nlj6W9OCgYIARAAGAQSNwF-L9IrHWc4KQZ6fDP3mhlQLO7_Sp9ox5_-91Nace3frBFobS9Av2ynjeEuOGzOU5vsgbbhrEA"
      });
      const accessToken = oauth2Client.getAccessToken();
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          type: "OAuth2",
          user: "neelianilkumar96@gmail.com",
          clientId:
            "682804697180-rvn5k7h139t0u3r3h0l5fobgljepnlg5.apps.googleusercontent.com",
          clientSecret: "cBFZzoJwFuZmexb6RTKKv357",
          refreshToken:
            "ya29.a0AfH6SMCxeInS1b1FyazPBK-ys-5sIasFcOS6pC6OBo3qhPlkhzjrwHubOZE6bAfmohcKGKc_vOpnkIi-0h_SRKJZBeLicv3J51Hg6xUBN8B6V_3hu4m-iYson4sT_csrPP_TABv26cMPrMWtB6AJVGMCTqVKDkaXyfk",
          accessToken: accessToken
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: result.email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `Please us the below link to avtivate your account <a href="${url}">${url}</a>` // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.status(200).json({ status: "success" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: "Internal Server Error" });
    }
  }
}).get("/confirmation/:token", async (req, res) => {
  try {
    const jwtData = validateToken(req.params.token);
    if (jwtData) {
      const { email } = jwtData;
      var filter = { email: email };
      const update = { emailverified: true };

      await Admin.findOneAndUpdate(filter, update, {
        new: true
      });
      res.status(200).json({ status: "success" });
    } else {
      res.status(500).json({ status: "Token tampered" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "Internal Server Error" });
  }
});

module.exports = SignupRouter;
