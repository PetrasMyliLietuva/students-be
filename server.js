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
  res.send("OK");
});

app.listen(port, () => console.log("Server is running"));
