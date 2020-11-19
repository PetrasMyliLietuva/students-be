const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const port = process.env.SERVER_PORT || 8080;
const adminPassword = process.env.ADMIN_PASS || "admin";

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

function checkDate() {
  let date = new Date();
  return date.getHours() >= 18 &&
    date.getHours() < 22 &&
    date.getDay() >= 1 &&
    date.getDay() < 5
    ? true
    : false;
}

app.get("/", (req, res) => {
  res.send("The server and database is working fine.");
});

app.get("/students", (req, res) => {
  console.log(checkDate());
  if (checkDate()) {
    con.query("SELECT * FROM students", (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Problem with selection from database.");
      } else {
        res.status(200).json(result);
      }
    });
  } else {
    res.status(400).send("There's no active class at the moment to register.");
  }
});

function nameCase(text) {
  let name = text.trim().toLowerCase();
  return name[0].toUpperCase() + name.slice(1);
}

app.post("/students", (req, res) => {
  console.log(req.body);
  if (
    req.body.name.trim() !== "" &&
    req.body.surname.trim() !== "" &&
    req.body.email.trim() !== ""
  ) {
    con.query(
      `INSERT INTO students (name, surname, email) VALUES('${nameCase(
        req.body.name
      )}','${nameCase(
        req.body.surname
      )}','${req.body.email.trim().toLowerCase()}')`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send("Problem with database.");
        } else {
          res.status(200).json(result);
        }
      }
    );
  } else {
    res.status(400).send("Check what you post.");
  }
});

app.post("/register", (req, res) => {
  let data = req.body;
  if (data.id > 0) {
    console.log(data);
    if (checkDate()) {
      let date = new Date().toLocaleDateString("lt-LT");
      con.query(
        `INSERT INTO attendance (student_id, date) VALUES(${data.id}, '${date}')`,
        (err, result) => {
          if (err) {
            console.log(err);
            res
              .status(400)
              .send(
                "Problem with posting to SQL database. Please try again later."
              );
          } else {
            res.status(200).send("ok");
            console.log(result);
          }
        }
      );
    } else {
      res.status(400).send("There is no active lectures to Register.");
    }
  } else {
    res
      .status(400)
      .send("The provided student id, name or surname is not correct.");
  }
});

app.get("/attendance", (req, res) => {
  let date = new Date().toLocaleDateString("lt-LT");
  console.log(date);
  con.query(
    `SELECT attendance.id, students.name, students.surname FROM students INNER JOIN attendance ON attendance.student_id = students.id WHERE date = '${date}'`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Problem with selection from database.");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.post("/delete", (req, res) => {
  console.log(req.body);
  if (req.body.id && req.body.pass === "gaidys") {
    con.query(
      `DELETE FROM attendance WHERE id = '${req.body.id}'`,
      (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(400)
            .send("There was an error with the DB when deleting a record.");
        } else {
          res.status(200).send(result);
          console.log(result);
        }
      }
    );
  } else {
    res.status(400).send("The password is wrong or the entry not exist.");
  }
});

app.listen(port, () => console.log("Server is running"));
