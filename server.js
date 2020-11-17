const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const port = process.env.SERVER_PORT || 8080;

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to DB");
});

const app = express();

app.use(bp.json());
app.use(cors());

app.get("/", (req, res) => {
  let submitTime = new Date().getHours();
  if (submitTime >= 18 && submitTime < 22) {
    con.query("SELECT * FROM students", (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Problem with selection from database.");
      } else {
        res.status(200).json(result);
      }
    });
  } else {
    res.status(400).send("It's too late to register on today's class.");
  }
});

app.get("/");

app.listen(port, () => console.log("Server is running"));
