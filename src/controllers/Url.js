const express = require("express");
require("../dbconfig/db");
const Url = require("../models/url");
const shortUrl = require("node-url-shortener");
const UrlRouter = express.Router();
const moment = require("moment");
UrlRouter.post("/", async (req, res) => {
  const { fullurl } = req.body;

  const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

  if (regexp.test(fullurl)) {
    const Shorturl = await Url.findOne({ fullurl }).exec();
    if (Shorturl) {
      res.status(200).json({ status: "success", url: Shorturl.shotrurl });
    } else {
      shortUrl.short(fullurl, (err, url) => {
        if (url) {
          const update = async (url_ob) => {
            try {
              await new Url({
                fullurl: fullurl,
                shotrurl: url_ob
              }).save();
              res.status(200).json({ status: "success", url: url });
            } catch (e) {
              console.error(e);
              res.status(500).json({ status: "Internal Server Error" });
            }
          };
          update(url);
        } else if (err) {
          res.status(500).json({ status: "Intenal Servor Error" });
        }
      });
    }
  } else {
    res.status(500).json({ status: "invalid Url" });
  }
})

  .get("/data", async (req, res) => {
    const data = await Url.find().exec();
    res.status(200).json(data);
  })
  .post("/count", async (req, res) => {
    const { fullurl } = req.body;
    const url = await Url.findOne({ fullurl }).exec();
    url.count++;
    url.save();
    res.status(200).json({ status: "pass" });
  })

  .get("/chart", async (req, res) => {
    var past_x_days = 30 * 86400000;
    try {
      const data = await Url.aggregate([
        {
          $match: {
            $expr: {
              $gt: [
                { $toDate: "$_id" },
                { $toDate: { $subtract: [new Date(), past_x_days] } }
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              dateYMD: {
                $dateFromParts: {
                  year: { $year: "$_id" },
                  month: { $month: "$_id" },
                  day: { $dayOfMonth: "$_id" }
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.dateYMD": -1 }
        },
        {
          $project: {
            _id: 0,
            count: 1,
            dateDMY: {
              $dateToString: { date: "$_id.dateYMD", format: "%d-%m-%Y" }
            }
          }
        }
      ]).exec();
      res.status(200).json({ result: data });
    } catch (e) {
      console.error();
      res.status(500);
    }
  });

module.exports = UrlRouter;
