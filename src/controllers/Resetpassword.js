const express = require("express");
const Admin = require("../models/user");
const { TokenGenerator } = require("../services/JWT");
const resetrouter = express.Router();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const { validateToken } = require("../services/JWT");
const { generateHash } = require("../services/hash");

resetrouter
  .post("/", async (req, res) => {
    const { email } = req.body;
    const admin = await Admin.findOne({ email }).exec();
    if (admin) {
      try {
        const oauth2Client = new OAuth2(
          process.env.ClientID,
          process.env.SECRET, // Client Secret
          "https://developers.google.com/oauthplayground" // Redirect URL
        );
        oauth2Client.setCredentials({
          refresh_token:process.env.TOKEN
        });
        const accessToken = oauth2Client.getAccessToken();

        const jwtToken = TokenGenerator(email);
        const url = `https://url-shornter-anil.netlify.app/resetpassword/${jwtToken}`;
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            type: "OAuth2",
            user: "neelianilkumar96@gmail.com",
            clientId:process.env.ClientID,
            clientSecret: process.env.SECRET,
            refreshToken:process.env.TOKEN,
            accessToken: accessToken
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Fred Foo 👻" <foo@example.com>', // sender address
          to: email, // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world?", // plain text body
          html: `Please us the below link to reset your password <a href="${url}">${url}</a>` // html body
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
    } else {
      res.status(400).json({ status: "user not found" });
    }
  })

  .post("/passwordchange", async (req, res) => {
    const { token, password } = req.body;
    try {
      const data = validateToken(token);
      if (data) {
        var filter = { email: data.email };
        const newpassword = await generateHash(password);
        const update = { passwordHash: newpassword };
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

module.exports = resetrouter;
