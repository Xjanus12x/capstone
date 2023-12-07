const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const server = express();
const bcrypt = require("bcrypt");
server.use(bodyParser.json());
const cors = require("cors");

server.use(cors());
// number of iterations or rounds for generating salt
const saltRounds = 10;

// Established the database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_icommit",
});

db.connect(function (error) {
  if (error) console.log("Error Connecting to DB");
  else console.log("Successfully Connected to DB");
});

// Establish the Port
server.listen(8085, function check(error) {
  if (error) console.log("Error...");
  else console.log("Started... 8085");
});

// Add new user
// server.post("/api/user/register", (req, res) => {
//   let user = {
//     emp_email: req.body.email,
//     emp_password: req.body.password,
//     emp_role: req.body.role,
//   }
//   let sql = "INSERT INTO tbl_users SET ?";
//   db.query(sql, user, (error) => {
//     if (error) {
//       res.send({ status: false, message: "User created failed" });
//     } else {
//       res.send({ status: true, message: "User created successfully" });
//     }
//   });
// });

server.post("/api/user/register", async (req, res) => {
  try {
    // You can adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    let user = {
      emp_email: req.body.email,
      emp_password: hashedPassword, // Store the hashed password
      emp_role: req.body.role,
    };

    let sql = "INSERT INTO tbl_users SET ?";
    db.query(sql, user, (error) => {
      if (error) {
        res.send({ status: false, message: "User created failed" });
      } else {
        res.send({ status: true, message: "User created successfully" });
      }
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
});

// Add employee details
server.post("/api/employee-details/add", (req, res) => {
  let details = {
    emp_firstname: req.body.emp_firstName,
    emp_lastname: req.body.emp_lastName,
    emp_number: req.body.emp_number,
    emp_dept: req.body.emp_department,
    emp_position: req.body.emp_position,
    emp_signature: req.body.emp_signature,
  };
  let sql = "INSERT INTO tbl_emp_details SET ?";
  db.query(sql, details, (error) => {
    if (error) {
      res.send({ status: false, message: "Employee details created failed" });
    } else {
      res.send({
        status: true,
        message: "Employee details created successfully",
      });
    }
  });
});

// fetch employee details
server.get("/api/employee-details", (req, res) => {
  let sql = "SELECT * FROM tbl_emp_details";
  db.query(sql, function (error, result) {
    if (error) console.log("Error Connecting to DB");
    else
      res.send({
        status: true,
        data: result,
      });
  });
});

// fetch users
server.get("/api/users", (req, res) => {
  let sql = "SELECT * FROM tbl_users";
  db.query(sql, function (error, result) {
    if (error) console.log("Error Connecting to DB");
    else
      res.send({
        status: true,
        data: result,
      });
  });
});

// fetch users
server.get("/api/user", (req, res) => {
  let sql = "SELECT * FROM tbl_users";
  db.query(sql, function (error, result) {
    if (error) console.log("Error Connecting to DB");
    else
      res.send({
        status: true,
        data: result,
      });
  });
});

// Login endpoint
server.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Fetch user data for the provided email
  let sql = "SELECT emp_id, emp_email, emp_password FROM tbl_users WHERE emp_email = ?";
  db.query(sql, [email], (error, result) => {
    if (error) {
      console.log("Error Connecting to DB");
      res.status(500).send({ status: false, message: "Internal Server Error" });
    } else if (result.length === 0) {
      res
        .status(401)
        .send({ status: false, message: "Invalid email or password" });
    } else {
      // Hash the provided password for comparison
      bcrypt.hash(password, saltRounds, (err, hashedProvidedPassword) => {
        if (err) {
          // Handle the error
          res
            .status(500)
            .send({ status: false, message: "Internal Server Error" });
        } else {
          // Compare hashed provided password with stored password hash
          bcrypt.compare(
            hashedProvidedPassword,
            result[0].password,
            (compareErr, passwordMatch) => {
              if (compareErr) {
                // Handle the error
                res
                  .status(500)
                  .send({ status: false, message: "Internal Server Error" });
              } else if (!passwordMatch) {
                // Passwords do not match - handle accordingly
                res.status(401).send({
                  status: false,
                  message: "Invalid email or password",
                });
              } else {
                // Passwords match - User is authenticated
                const userData = {
                  user_id: result[0].user_id,
                  email: result[0].email,
                };

                // You can generate a JWT token or use a session mechanism here
                // and then send it to the client for subsequent authenticated requests.
                res.send({
                  status: true,
                  message: "Login successful",
                  data: userData,
                });
              }
            }
          );
        }
      });
    }
  });
});
