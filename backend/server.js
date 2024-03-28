// const express = require("express");
// const bodyParser = require("body-parser");
// const mysql = require("mysql");
// const server = express();
// const bcrypt = require("bcrypt");
// server.use(bodyParser.json());
// const cors = require("cors");
// server.use(cors());
// // number of iterations or rounds for generating salt
// const saltRounds = 10;

// // Establish the database connection pool with custom timeout settings
// // const db = mysql.createPool({
// //   connectionLimit: 10,
// //   host: "localhost",
// //   user: "root",
// //   password: "",
// //   database: "db_hau_commit",
// //   connectTimeout: 20000, // Set connection timeout to 20 seconds (in milliseconds)
// //   acquireTimeout: 20000, // Set acquire timeout to 20 seconds (in milliseconds)
// //   timeout: 20000, // Set operation timeout to 20 seconds (in milliseconds)
// // });

// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: "118.139.176.23",
//   user: "hau_commit",
//   password: "hau_commit",
//   database: "db_hau_commit",
//   connectTimeout: 20000, // Set connection timeout to 20 seconds (in milliseconds)
//   acquireTimeout: 20000, // Set acquire timeout to 20 seconds (in milliseconds)
//   timeout: 20000, // Set operation timeout to 20 seconds (in milliseconds)
// });

// server.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// // Test route to check CORS headers
// server.options("/test-cors", cors()); // Enable preflight for this route
// server.post("/test-cors", (req, res) => {
//   res.send("CORS Test Successful");
// });

// // Error handling middleware for CORS errors
// server.use((err, req, res, next) => {
//   if (err.name === "UnauthorizedError") {
//     res.status(403).json({ error: "CORS Error: " + err.message });
//   }
// });

// db.getConnection((error, connection) => {
//   if (error) {
//     console.error("Error Connecting to DB:", error);
//   } else {
//     console.log("Successfully Connected to DB");
//     connection.release();
//   }
// });

// // prod
// // Established the database connection
// // const db = mysql.createConnection({
// //   host: "118.139.176.23",
// //   user: "hau_commit",
// //   password: "hau_commit",
// //   database: "db_hau_commit",
// // });

// // db.connect(function (error) {
// //   if (error) console.log("Error Connecting to DB");
// //   else console.log("Successfully Connected to DB");
// // });

// // Establish the Port
// server.listen(8085, function check(error) {
//   if (error) console.log("Error...");
//   else console.log("Started... 8085");
// });

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

// Establish the database connection pool with custom timeout settings
const db = mysql.createPool({
  connectionLimit: 10,
  host: "118.139.176.23",
  user: "hau_commit",
  password: "hau_commit",
  database: "db_hau_commit",
  connectTimeout: 20000,
  acquireTimeout: 20000,
  timeout: 20000,
});

// Middleware for handling CORS headers globally
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Test route to check CORS headers
server.options("/test-cors", cors()); // Enable preflight for this route
server.post("/test-cors", (req, res) => {
  res.send("CORS Test Successful");
});

// Error handling middleware for CORS errors
server.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).json({ error: "CORS Error: " + err.message });
  }
});

// Establish the database connection
db.getConnection((error, connection) => {
  if (error) {
    console.error("Error Connecting to DB:", error);
  } else {
    console.log("Successfully Connected to DB");
    connection.release();
  }
});

// Listen on the specified port
const PORT = process.env.PORT || 8085;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.post("/api/test", (req, res) => {
  res.send("hello");
});

// Add new user
server.post("/api/user/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    let user = {
      emp_email: req.body.email,
      emp_password: hashedPassword, // Store the hashed password
      emp_role: req.body.role,
      emp_number: req.body.emp_number,
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
  db.query(sql, details, (error, result) => {
    if (error) {
      res.send({ status: false, message: "Employee details created failed" });
    } else {
      res.send({
        status: true,
        message: "Employee details created successfully",
        data: result[0],
      });
    }
  });
});

// fetch user
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

// fetch igcf informations
server.get("/api/igcf-information", (req, res) => {
  const { dept_name } = req.query; // Assuming dept_name is passed as a query parameter

  if (!dept_name) {
    return res.status(400).send({
      status: false,
      message: "Missing 'dept_name' parameter",
    });
  }

  let sql = "SELECT * FROM tbl_igcf_information WHERE dept_name = ?";

  db.query(sql, [dept_name], function (error, result) {
    if (error) {
      console.log("Error Connecting to DB");
      return res.status(500).send({
        status: false,
        message: "Error connecting to the database",
      });
    } else {
      res.send({
        status: true,
        data: result,
      });
    }
  });
});

// // Login endpoint
// server.post("/api/login", (req, res) => {
//   const { emp_email, emp_password } = req.body;
//   // Validate that emp_email and emp_password are present in the request body
//   if (!emp_email || !emp_password) {
//     return res
//       .status(400)
//       .send({ status: false, message: "Invalid request format" });
//   }

//   // Fetch user data for the provided email
//   const sql = "SELECT * FROM tbl_users WHERE emp_email = ?";
//   db.query(sql, [emp_email], (error, result) => {
//     if (error) {
//       console.error("Error connecting to DB:", error);
//       return res
//         .status(500)
//         .send({ status: false, message: "Internal Server Error" });
//     } else if (result.length === 0) {
//       return res
//         .status(401)
//         .send({ status: false, message: "Invalid email or password" });
//     }

//     // Compare the provided password with the stored hashed password
//     const storedPasswordHash = result[0].emp_password;
//     bcrypt.compare(
//       emp_password,
//       storedPasswordHash,
//       (compareErr, passwordMatch) => {
//         if (compareErr) {
//           console.error("Error comparing passwords:", compareErr);
//           return res
//             .status(500)
//             .send({ status: false, message: "Internal Server Error" });
//         } else if (passwordMatch) {
//           // Fetch employee number
//           const empNumber =
//             "SELECT emp_dept FROM tbl_emp_details WHERE emp_number = ?";
//           db.query(empNumber, [result[0].emp_number], (error, result2) => {
//             if (error) {
//               console.error("Error connecting to DB:", error);
//               return res
//                 .status(500)
//                 .send({ status: false, message: "Internal Server Error" });
//             } else if (result2.length === 0) {
//               return res
//                 .status(401)
//                 .send({ status: false, message: "Invalid employee details" });
//             } else {
//               const userData = {
//                 emp_id: result[0].user_id,
//                 emp_email: result[0].emp_email,
//                 emp_role: result[0].emp_role,
//                 emp_dept: result2[0].emp_dept,
//                 emp_number: result[0].emp_number,
//               };

//               return res.send({
//                 status: true,
//                 message: "Login successful",
//                 data: userData,
//               });
//             }
//           });
//         } else {
//           // Passwords do not match
//           return res.status(401).send({
//             status: false,
//             message: "Invalid email or password",
//           });
//         }
//       }
//     );
//   });
// });

// Login endpoint
server.post("/api/login", (req, res) => {
  const { emp_email, emp_password } = req.body;
  // Validate that emp_email and emp_password are present in the request body
  if (!emp_email || !emp_password) {
    return res
      .status(400)
      .send({ status: false, message: "Invalid request format" });
  }

  try {
    // Fetch user data for the provided email
    const sql = "SELECT * FROM tbl_users WHERE emp_email = ?";
    db.query(sql, [emp_email], async (error, result) => {
      if (error) {
        console.error("Error connecting to DB:", error);
        return res
          .status(500)
          .send({ status: false, message: "Internal Server Error" });
      } else if (result.length === 0) {
        return res
          .status(401)
          .send({ status: false, message: "Invalid email or password" });
      }

      // Compare the provided password with the stored hashed password
      const storedPasswordHash = result[0].emp_password;
      const passwordMatch = await bcrypt.compare(
        emp_password,
        storedPasswordHash
      );

      if (passwordMatch) {
        // Fetch employee number
        const empNumber =
          "SELECT emp_dept FROM tbl_emp_details WHERE emp_number = ?";
        db.query(empNumber, [result[0].emp_number], (error, result2) => {
          if (error) {
            console.error("Error connecting to DB:", error);
            return res
              .status(500)
              .send({ status: false, message: "Internal Server Error" });
          } else if (result2.length === 0) {
            return res
              .status(401)
              .send({ status: false, message: "Invalid employee details" });
          } else {
            const userData = {
              emp_id: result[0].user_id,
              emp_email: result[0].emp_email,
              emp_role: result[0].emp_role,
              emp_dept: result2[0].emp_dept,
              emp_number: result[0].emp_number,
            };

            return res.send({
              status: true,
              message: "Login successful",
              data: userData,
            });
          }
        });
      } else {
        // Passwords do not match
        return res.status(401).send({
          status: false,
          message: "Invalid email or password",
        });
      }
    });
  } catch (error) {
    console.error("Error in login endpoint:", error);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error" });
  }
});

server.post("/api/user/check-existence", (req, res) => {
  try {
    const { emp_email } = req.body;

    // Check if the email already exists in tbl_pending_registration
    const checkPendingRegistrationQuery =
      "SELECT email FROM tbl_pending_registration WHERE email = ?";
    db.query(
      checkPendingRegistrationQuery,
      [emp_email],
      (error1, pendingUser) => {
        if (error1) {
          console.error("Error checking pending user existence:", error1);
          res
            .status(500)
            .send({ status: false, message: "Internal Server Error" });
          return;
        }

        // Check if the email already exists in tbl_users
        const checkUsersQuery =
          "SELECT emp_email FROM tbl_users WHERE emp_email = ?";
        db.query(checkUsersQuery, [emp_email], (error2, existingUser) => {
          if (error2) {
            console.error("Error checking user existence:", error2);
            res
              .status(500)
              .send({ status: false, message: "Internal Server Error" });
            return;
          }

          // Respond with a boolean indicating whether the user exists in either table
          const exists = pendingUser.length > 0 || existingUser.length > 0;
          res.send({ exists });
        });
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
});

// fetch specific employee details
server.get("/api/get/employee-details", (req, res) => {
  const { emp_number } = req.query;
  if (!emp_number) {
    return res.status(400).send({
      status: false,
      message: "Missing 'emp_number' parameter",
    });
  }

  let sql = "SELECT * FROM tbl_emp_details WHERE emp_number = ? LIMIT 1";

  db.query(sql, [emp_number], function (error, result) {
    if (error) {
      console.log("Error Connecting to DB");
      return res.status(500).send({
        status: false,
        message: "Error connecting to the database",
      });
    } else {
      if (result.length === 0) {
        return res.status(404).send({
          status: false,
          message: "Employee details not found",
        });
      }
      const data = {
        emp_dept: result[0].emp_dept,
        emp_fullname: `${result[0].emp_firstname} ${result[0].emp_lastname}`,
        emp_number: result[0].emp_number,
        emp_signature: result[0].emp_signature,
        emp_position: result[0].emp_position,
      };
      res.send({
        status: true,
        data: data, // Return only the first matching result
      });
    }
  });
});

// signed the submitted igcf
server.post("/api/signed-igcf", (req, res) => {
  const {
    id,
    equivalent_ratings,
    overall_weighted_average_rating,
    equivalent_description,
    ratee_fullname,
    ratee_signature,
    ratee_date_signed,
  } = req.body;

  // Construct the SQL UPDATE statement
  const sql = `UPDATE tbl_emp_submitted_igcf
               SET equivalent_ratings = ?,
                   overall_weighted_average_rating = ?,
                   equivalent_description = ?,
                   ratee_fullname = ?,
                   ratee_signature = ?,
                   ratee_date_signed = ?
               WHERE id = ?`; // Assuming 'id' is the primary key of the row you want to update

  // Execute the SQL query
  db.query(
    sql,
    [
      equivalent_ratings,
      overall_weighted_average_rating,
      equivalent_description,
      ratee_fullname,
      ratee_signature,
      ratee_date_signed,
      id,
    ],
    (error, result) => {
      if (error) {
        console.error("Error updating submitted IGCF:", error);
        res.status(500).json({ error: "Error updating submitted IGCF" });
      } else {
        console.log("Submitted IGCF updated successfully");
        res
          .status(200)
          .json({ message: "Submitted IGCF updated successfully" });
      }
    }
  );
});

//get all users
server.get("/api/get/users", (req, res) => {
  // Extract department name from request query parameters
  const { dept_name } = req.query;

  // Construct the SQL query with a WHERE clause to filter by department name
  let sql = `
    SELECT u.emp_email, u.emp_role, u.emp_number, d.emp_firstname, d.emp_lastname, d.emp_position, d.emp_dept 
    FROM tbl_users AS u 
    JOIN tbl_emp_details AS d ON u.emp_number = d.emp_number
    WHERE d.emp_dept = ?
  `;

  // Execute the SQL query with department name as a parameter
  db.query(sql, [dept_name], function (error, result) {
    if (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    } else {
      res.status(200).json(result);
    }
  });
});

// Update user information
server.post("/api/update/user", (req, res) => {
  const {
    firstname,
    lastname,
    dept,
    role,
    position,
    emp_number,
    old_emp_number,
  } = req.body;

  let tblUsersSqlUpdate = `UPDATE tbl_users
               SET emp_role = ?,
                   emp_number = ?
               WHERE emp_number = ?`;
  let tblEmpDetailsSqlUpdate = `UPDATE tbl_emp_details 
                                SET  emp_firstname = ?, 
                                     emp_lastname = ?, 
                                     emp_number = ?, 
                                     emp_dept = ?, 
                                     emp_position = ?            
                                WHERE emp_number = ?`;

  let tblEmpSubmittedIgcfSqlUpdate = `UPDATE tbl_emp_submitted_igcf
                                      SET fullname = ?,
                                          emp_number = ?,
                                          emp_position = ?,
                                          emp_dept = ?                                   
                                      WHERE emp_number = ?`;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).json({ error: "Error starting transaction" });
      return;
    }

    db.query(
      tblUsersSqlUpdate,
      [role, emp_number, old_emp_number],
      (err, resultUsers) => {
        if (err) {
          db.rollback(() => {
            console.error("Error updating tbl_users:", err);
            res.status(500).json({ error: "Error updating tbl_users" });
          });
          return;
        }

        db.query(
          tblEmpDetailsSqlUpdate,
          [firstname, lastname, emp_number, dept, position, old_emp_number],
          (err, resultEmpDetails) => {
            if (err) {
              db.rollback(() => {
                console.error("Error updating tbl_emp_details:", err);
                res
                  .status(500)
                  .json({ error: "Error updating tbl_emp_details" });
              });
              return;
            }

            db.query(
              tblEmpSubmittedIgcfSqlUpdate,
              [
                `${firstname} ${lastname}`,
                emp_number,
                position,
                dept,
                old_emp_number,
              ],
              (err, resultEmpSubmittedIgcf) => {
                if (err) {
                  db.rollback(() => {
                    console.error("Error updating tbl_emp_submitted:", err);
                    res
                      .status(500)
                      .json({ error: "Error updating tbl_emp_submitted" });
                  });
                  return;
                }

                db.commit((err) => {
                  if (err) {
                    db.rollback(() => {
                      console.error("Error committing transaction:", err);
                      res
                        .status(500)
                        .json({ error: "Error committing transaction" });
                    });
                    return;
                  }

                  console.log("Transaction completed successfully.");
                  res.status(200).send({ success: true });
                });
              }
            );
          }
        );
      }
    );
  });
});

// Delete user information
server.delete("/api/delete/user/:emp_number", (req, res) => {
  const { emp_number } = req.params;

  let tblUsersSqlDelete = `DELETE FROM tbl_users WHERE emp_number = ?`;
  let tblEmpDetailsSqlDelete = `DELETE FROM tbl_emp_details WHERE emp_number = ?`;
  let tblEmpSubmittedIgcfSqlDelete = `DELETE FROM tbl_emp_submitted_igcf WHERE emp_number = ?`;

  db.query(tblUsersSqlDelete, [emp_number], (err, resultUsers) => {
    if (err) {
      console.error("Error deleting from tbl_users:", err);
      res.status(500).json({ error: "Error deleting from tbl_users" });
      return;
    }

    db.query(tblEmpDetailsSqlDelete, [emp_number], (err, resultEmpDetails) => {
      if (err) {
        console.error("Error deleting from tbl_emp_details:", err);
        res.status(500).json({ error: "Error deleting from tbl_emp_details" });
        return;
      }

      db.query(
        tblEmpSubmittedIgcfSqlDelete,
        [emp_number],
        (err, resultEmpSubmittedIgcf) => {
          if (err) {
            console.error("Error deleting from tbl_emp_submitted_igcf:", err);
            res
              .status(500)
              .json({ error: "Error deleting from tbl_emp_submitted_igcf" });
            return;
          }

          console.log("User information deleted successfully.");
          res.status(200).send({ success: true });
        }
      );
    });
  });
});

server.post("/api/set/igcf-deadline", (req, res) => {
  const { date, dept } = req.body; // Use req.body instead of req.params to get the data from the request body

  // Check if the department already exists in the table
  let checkIfExistsSql = `SELECT * FROM tbl_igcf_deadline WHERE dept = ?`;
  db.query(checkIfExistsSql, [dept], (error, results) => {
    if (error) {
      console.error("Error checking department:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to check department" });
      return;
    }

    if (results.length > 0) {
      // Department exists, update the record
      let updateSql = `UPDATE tbl_igcf_deadline SET date = ? WHERE dept = ?`;
      db.query(updateSql, [date, dept], (error, results) => {
        if (error) {
          console.error("Error updating IGCF deadline:", error);
          res.status(500).json({
            success: false,
            message: "Failed to update IGCF deadline",
          });
        } else {
          console.log("IGCF deadline updated successfully");
          res.status(200).json({
            success: true,
            message: "IGCF deadline updated successfully",
          });
        }
      });
    } else {
      // Department does not exist, insert a new record
      let insertSql = `INSERT INTO tbl_igcf_deadline (dept, date) VALUES (?, ?)`;
      db.query(insertSql, [dept, date], (error, results) => {
        if (error) {
          console.error("Error setting IGCF deadline:", error);
          res
            .status(500)
            .json({ success: false, message: "Failed to set IGCF deadline" });
        } else {
          console.log("IGCF deadline set successfully");
          res
            .status(200)
            .json({ success: true, message: "IGCF deadline set successfully" });
        }
      });
    }
  });
});

server.get("/api/get/dead-lines", (req, res) => {
  const { dept } = req.query;
  let sql = "";
  dept === "all"
    ? (sql = `SELECT dept, date FROM tbl_igcf_deadline`)
    : (sql = `SELECT dept, date FROM tbl_igcf_deadline WHERE dept = ?`);
  // Execute the SQL query
  db.query(sql, [dept], (err, results) => {
    if (err) {
      // Handle error
      console.error("Error fetching deadlines:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    // Send the results back as response
    res.status(200).json(results);
  });
});

server.get("/api/get/igcf-informations", (req, res) => {
  const { dept } = req.query;
  let sql = "SELECT * FROM tbl_igcf_information WHERE dept_name = ?";

  db.query(sql, [dept], (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching IGCF information." });
    } else {
      // Successfully fetched IGCF information, send it to the client
      res.status(200).json(result);
    }
  });
});

server.post("/api/add/pending-registration", async (req, res) => {
  const {
    email,
    password,
    role,
    emp_firstName,
    emp_lastName,
    emp_number,
    emp_dept,
    emp_position,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let pendingUser = {
      email: email,
      password: hashedPassword, // Store the hashed password
      role: role,
      emp_firstname: emp_firstName,
      emp_lastname: emp_lastName,
      emp_number: emp_number,
      emp_dept: emp_dept,
      emp_position: emp_position,
    };

    let sql = "INSERT INTO tbl_pending_registration SET ?";
    db.query(sql, pendingUser, (err, result) => {
      if (err) {
        console.error("Error inserting pending registration:", err);
        res.status(500).json({ error: "Error inserting pending registration" });
        return;
      }

      console.log("Pending registration inserted successfully.");
      res.status(200).json({ success: true });
    });
  } catch (error) {
    console.error("Error processing pending registration:", error);
    res.status(500).json({ error: "Error processing pending registration" });
  }
});

server.get("/api/get/pending-users", (req, res) => {
  try {
    const { dept } = req.query;

    let sql =
      "SELECT id, email, role, emp_firstname, emp_lastname, emp_number, emp_dept, emp_position FROM tbl_pending_registration WHERE emp_dept = ?";

    db.query(sql, [dept], (error, results) => {
      if (error) {
        console.error("Error retrieving pending users:", error);
        res.status(500).json({ error: "Error retrieving pending users" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.delete("/api/del/pending-user/:id", (req, res) => {
  const { id } = req.params;
  let sql = "DELETE FROM tbl_pending_registration WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting pending user:", err);
      res.status(500).json({ error: "Error deleting pending user" });
      return;
    }
    console.log("Pending user deleted successfully.");
    res.status(200).json({ success: true });
  });
});

server.post("/api/add/accept-pending-user", (req, res) => {
  const {
    email,
    emp_dept,
    emp_firstname,
    emp_lastname,
    emp_number,
    emp_position,
    role,
  } = req.body;

  // Retrieve the password from tbl_pending_registration using email and employee number
  let sql2 =
    "SELECT password FROM tbl_pending_registration WHERE email = ? AND emp_number = ?";
  db.query(sql2, [email, emp_number], (error2, result2) => {
    if (error2) {
      console.error("Error retrieving password:", error2);
      res.status(500).json({ error: "Error retrieving password" });
      return;
    }

    if (result2.length === 0) {
      console.error(
        "No pending registration found for the provided email and employee number."
      );
      res.status(404).json({
        error:
          "No pending registration found for the provided email and employee number.",
      });
      return;
    }

    const password = result2[0].password; // Retrieve the password from the result

    // Insert the employee details into tbl_emp_details
    let empDetails = {
      emp_firstname: emp_firstname,
      emp_lastname: emp_lastname,
      emp_number: emp_number,
      emp_dept: emp_dept,
      emp_position: emp_position,
    };

    let sql1 = "INSERT INTO tbl_emp_details SET ?";
    db.query(sql1, empDetails, (error1, result1) => {
      if (error1) {
        console.error("Error inserting employee details:", error1);
        res.status(500).json({ error: "Error inserting employee details" });
        return;
      }

      // Finally, insert the user into tbl_users
      let newUser = {
        emp_email: email,
        emp_password: password, // Use the retrieved password
        emp_role: role,
        emp_number: emp_number,
      };

      let sql3 = "INSERT INTO tbl_users SET ?";
      db.query(sql3, newUser, (error3, result3) => {
        if (error3) {
          console.error("Error inserting user:", error3);
          res.status(500).json({ error: "Error inserting user" });
          return;
        }

        console.log("User added successfully.");
        res.status(200).json({ success: true });
      });
    });
  });
});

server.post("/api/update/pending-user", (req, res) => {
  const { id, firstname, lastname, role, emp_number, dept, position } =
    req.body;

  try {
    let sql = `
      UPDATE tbl_pending_registration 
      SET emp_firstname = ?,
          emp_lastname = ?,
          role = ?,
          emp_number = ?,
          emp_dept = ?,
          emp_position = ?
      WHERE id = ?`;

    db.query(
      sql,
      [firstname, lastname, role, emp_number, dept, position, id],
      (err, result) => {
        if (err) {
          console.error("Error updating pending user:", err);
          res.status(500).json({ error: "Error updating pending user" });
          return;
        }

        console.log("Pending user updated successfully.");
        res.status(200).json({ success: true });
      }
    );
  } catch (error) {
    console.error("Error processing pending user update:", error);
    res.status(500).json({ error: "Error processing pending user update" });
  }
});

// actionPlan: "asdffadsadfs";
// responsible: "Dean,Chair";
// target: ">=22 (03-21-2024 to 04-20-2024)";
// timeFrame: "03-21-2026 - 03-28-2026";
// title: "fdsadfsdfas";
server.post("/api/add/kpi-and-action-plans", (req, res) => {
  const kpiAndActionPlans = req.body;
  console.log(kpiAndActionPlans);
  // Extract the array of KPIs from the form data

  // Initialize an array to store the SQL values for bulk insertion
  const sqlValues = [];

  // Iterate over each KPI object and push its values to the SQL values array
  //   kpi_title: kpiTitle,
  // plan,
  // responsibles,
  // startDateFormatted,
  // dueDateFormatted,
  // targets: JSON.stringify(targetObj),
  kpiAndActionPlans.forEach((kpiAndActionPlan) => {
    sqlValues.push([
      kpiAndActionPlan.kpi_title,
      kpiAndActionPlan.plan,
      kpiAndActionPlan.startDateFormatted,
      kpiAndActionPlan.dueDateFormatted,
      kpiAndActionPlan.targets,
      kpiAndActionPlan.responsibles,
      kpiAndActionPlan.dept,
    ]);
  });

  // SQL query to insert the KPIs into tbl_kpis
  const sql =
    "INSERT INTO tbl_kpi_and_action_plans (kpi_title, action_plan, start_date, due_date, targets, responsibles, dept) VALUES ?";

  // Execute the SQL query with the SQL values array for bulk insertion
  db.query(sql, [sqlValues], (error, result) => {
    if (error) {
      console.error("Error inserting KPIs:", error);
      res.status(500).json({ error: "Error inserting KPIs" });
    } else {
      console.log("KPIs inserted successfully.");
      res.status(200).json({ message: "KPIs inserted successfully." });
    }
  });
});

server.get("/api/get/kpi-and-action-plans", (req, res) => {
  const { dept } = req.query; // Assuming department is passed as a query parameter
  // Execute the SQL query to retrieve data from both tables based on department
  const sqlQuery = `
        SELECT  *
        FROM tbl_kpi_and_action_plans WHERE dept = ?
    `;

  // Execute the query with department as a parameter
  db.query(sqlQuery, [dept], (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving data" });
    } else {
      // Send the result as JSON response
      res.status(200).json(result);
    }
  });
});

server.delete("/api/delete/kpi-and-action-plan", (req, res) => {
  const { id } = req.query;

  // Execute the SQL query to delete records from tbl_kpis
  const sqlQueryKPIs = `DELETE FROM tbl_kpi_and_action_plans WHERE id = ?`;

  // Execute the query with the provided ID
  db.query(sqlQueryKPIs, [id], (error, results) => {
    if (error) {
      // Handle the error
      console.error("Error deleting KPIs:", error);
      res.status(500).send("Error deleting KPIs");
      return;
    }
    // If the query was successful, send a success response
    console.log("KPIs deleted successfully:", results.affectedRows);
    res.status(200).send("KPIs deleted successfully");
  });
});

server.post("/api/submit-igcf", (req, res) => {
  const {
    fullname,
    emp_number,
    emp_position,
    emp_dept,
    completion_date,
    formData,
  } = req.body;

  // Insert data into tbl_igcf_submission_history
  let igcfSubmissionHistoryQuery = `
      INSERT INTO tbl_igcf_submission_history SET ?`;
  let empDetails = {
    fullname,
    emp_number,
    emp_position,
    emp_dept,
    completion_date,
  };
  db.query(igcfSubmissionHistoryQuery, empDetails, (err, result) => {
    if (err) {
      console.error("Error updating pending user:", err);
      res.status(500).json({ error: "Error updating pending user" });
      return;
    }

    // Get the ID of the inserted record
    const igcfSubmissionHistoryId = result.insertId;
    // Initialize an array to store the SQL values for bulk insertion
    const sqlValues = [];

    formData.forEach((kpi) => {
      sqlValues.push([
        igcfSubmissionHistoryId,
        kpi.selected_kpi,
        kpi.personalObject,
        kpi.target,
        kpi.initiatives,
        kpi.personalMeasures,
        kpi.weight,
      ]);
    });
    const submittedIgcfDetailsQuery =
      "INSERT INTO tbl_submitted_igcf_details (tbl_igcf_submission_history_id, selected_kpi, selected_plan ,selected_plan_weight, initiatives, personal_measures_kpi ,weight) VALUES ?";

    // Execute the SQL query with the SQL values array for bulk insertion
    db.query(submittedIgcfDetailsQuery, [sqlValues], (err, result) => {
      if (err) {
        console.error("Error inserting KPIs:", err);
        res.status(500).json({ error: "Error inserting KPIs" });
        return;
      }

      console.log("KPIs inserted successfully.");
      res.status(200).json({ success: true });
    });
  });
});

server.get("/api/get/igcf-submission-history-by-dept", (req, res) => {
  const { dept } = req.query;
  let sql = `
      SELECT
          sh.*,
          p2i.rate_date
      FROM
          tbl_igcf_submission_history sh
      LEFT JOIN
          tbl_part_two_igcf p2i
      ON
          sh.id = p2i.tbl_submitted_igcf_details_id
      WHERE
          sh.emp_dept = ?
    `;
  db.query(sql, [dept], (error, results) => {
    if (error) {
      console.error("Error fetching submission history:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // If the query was successful, send the results back to the client
    res.status(200).json(results);
  });
});

server.get("/api/get/igcf-submission-history-by-emp-num", (req, res) => {
  const { emp_number } = req.query;
  let sql = `
      SELECT
          sh.*,
          p2i.rate_date
      FROM
          tbl_igcf_submission_history sh
      LEFT JOIN
          tbl_part_two_igcf p2i
      ON
          sh.id = p2i.tbl_submitted_igcf_details_id
      WHERE
          sh.emp_number = ?
    `;
  db.query(sql, [emp_number], (error, results) => {
    if (error) {
      console.error("Error fetching submission history:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // If the query was successful, send the results back to the client
    res.status(200).json(results);
  });
});

server.get("/api/get/igcf-submission-history-every-dept", (req, res) => {
  let sql = `
      SELECT
          sh.*,
          p2i.rate_date
      FROM
          tbl_igcf_submission_history sh
      LEFT JOIN
          tbl_part_two_igcf p2i
      ON
          sh.id = p2i.tbl_submitted_igcf_details_id
    `;
  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching submission history:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // If the query was successful, send the results back to the client
    res.status(200).json(results);
  });
});

server.delete("/api/del/submitted-igcf/:id", (req, res) => {
  const id = req.params.id;

  // Define the SQL query string
  let deleteSubmissionHistory =
    "DELETE FROM tbl_igcf_submission_history WHERE id = ?";

  let deleteSubmittedIgcfDetails =
    "DELETE FROM tbl_submitted_igcf_details WHERE tbl_igcf_submission_history_id = ?";

  let deletePartTwoIgcf =
    "DELETE FROM tbl_part_two_igcf WHERE tbl_submitted_igcf_details_id = ?";

  // Delete from tbl_igcf_submission_history
  db.query(deleteSubmissionHistory, [id], (err1, result1) => {
    if (err1) {
      console.error("Error deleting submission history:", err1);
      res.status(500).json({ error: "Error deleting submission history" });
      return;
    }

    // Delete from tbl_submitted_igcf_details
    db.query(deleteSubmittedIgcfDetails, [id], (err2, result2) => {
      if (err2) {
        console.error("Error deleting submitted IGCF details:", err2);
        res
          .status(500)
          .json({ error: "Error deleting submitted IGCF details" });
        return;
      }

      // Delete from tbl_part_two_igcf
      db.query(deletePartTwoIgcf, [id], (err3, result3) => {
        if (err3) {
          console.error("Error deleting part two IGCF:", err3);
          res.status(500).json({ error: "Error deleting part two IGCF" });
          return;
        }

        console.log("Submitted IGCF deleted successfully.");
        res
          .status(200)
          .json({ message: "Submitted IGCF deleted successfully." });
      });
    });
  });
});

// server.delete("/api/del/submitted-igcf/:id", (req, res) => {
//   const id = req.params.id;

//   // Perform the DELETE operation in your database
//   let deleteSubmissionHistory =
//     "DELETE FROM tbl_igcf_submission_history WHERE id = ?";

//   let deleteSubmittedIgcfDetails =
//     "DELETE FROM tbl_submitted_igcf_details WHERE tbl_igcf_submission_history_id = ?";

//   let deletePartTwoIgcf =
//     "DELETE FROM tbl_part_two_igcf WHERE tbl_submitted_igcf_details_id = ?";

//   // Get completion date
//   db.query(id, (err, result) => {
//     if (err) {
//       console.error("Error getting completion date:", err);
//       res.status(500).json({ error: "Error getting completion date" });
//       return;
//     }

//     // Delete from tbl_igcf_submission_history
//     db.query(deleteSubmissionHistory, [id], (err1, result1) => {
//       if (err1) {
//         console.error("Error deleting submission history:", err1);
//         res.status(500).json({ error: "Error deleting submission history" });
//         return;
//       }

//       // Delete from tbl_submitted_igcf_details
//       db.query(
//         deleteSubmittedIgcfDetails,
//         [id],
//         (err2, result2) => {
//           if (err2) {
//             console.error("Error deleting submitted IGCF details:", err2);
//             res
//               .status(500)
//               .json({ error: "Error deleting submitted IGCF details" });
//             return;
//           }

//           // Delete from tbl_part_two_igcf
//           db.query(deletePartTwoIgcf, [id], (err3, result3) => {
//             if (err3) {
//               console.error("Error deleting part two IGCF:", err3);
//               res.status(500).json({ error: "Error deleting part two IGCF" });
//               return;
//             }

//             console.log("Submitted IGCF deleted successfully.");
//             res
//               .status(200)
//               .json({ message: "Submitted IGCF deleted successfully." });
//           });
//         }
//       );
//     });
//   });
// });

server.get("/api/get/submitted-igcf-details", (req, res) => {
  const { id } = req.query;

  // Query to fetch submitted IGCF details based on the provided id
  let getSubmittedIgcfDetailsQuery =
    "SELECT * FROM tbl_submitted_igcf_details WHERE tbl_igcf_submission_history_id = ?";

  // Execute the query with the provided id
  db.query(getSubmittedIgcfDetailsQuery, [id], (err, result) => {
    if (err) {
      console.error("Error fetching submitted IGCF details:", err);
      res.status(500).json({ error: "Error fetching submitted IGCF details" });
      return;
    }

    // Check if any data was returned
    if (result.length === 0) {
      // No data found with the provided id
      res.status(404).json({ error: "Submitted IGCF details not found" });
      return;
    }

    // Data found, send it in the response
    res.status(200).json(result); // Assuming only one row is expected, so sending the first row
  });
});

server.post("/api/update/rate-igcf", (req, res) => {
  const {
    id,
    ratee_fullname,
    overall_weighted_average_rating,
    equivalent_description,
    rates,
    step1,
    step2,
    step3,
    step4,
    step5,
    rate_date,
  } = req.body;

  // Iterate over each rate and execute a parameterized update query
  rates.forEach((rate) => {
    const { achieved, rating, uniqueId } = rate;
    const updateQuery =
      "UPDATE tbl_submitted_igcf_details SET achieved = ?, rating = ? WHERE id = ?";

    // Execute the parameterized query with rate values
    db.query(updateQuery, [achieved, rating, uniqueId], (err, result) => {
      if (err) {
        console.error("Error updating IGCF rate:", err);
        // If an error occurs, you might want to handle it appropriately
        return;
      }
      console.log(`IGCF rate with ID ${uniqueId} updated successfully.`);
    });
  });

  // Construct the SQL query to insert into tbl_part_two_igcf
  const insertQuery =
    "INSERT INTO tbl_part_two_igcf (tbl_submitted_igcf_details_id, ratee_fullname ,overall_weighted_average_rating, equivalent_description, top_three_least_agc, top_three_highly_agc, top_three_competencies_improvement, top_three_competency_strengths, top_three_training_development_suggestion ,rate_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  // Execute the insert query with the array of values
  db.query(
    insertQuery,
    [
      id,
      ratee_fullname,
      overall_weighted_average_rating,
      equivalent_description,
      step1,
      step2,
      step3,
      step4,
      step5,
      rate_date,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting into tbl_part_two_igcf:", err);
        res
          .status(500)
          .json({ error: "Error inserting into tbl_part_two_igcf" });
        return;
      }
      console.log("Data inserted into tbl_part_two_igcf successfully.");

      // Send a response once all updates and insertions are completed
      res.status(200).json({ success: true });
    }
  );
});

server.get("/api/get/igcf-part-two", (req, res) => {
  const { id } = req.query;
  const sql =
    "SELECT * FROM tbl_part_two_igcf WHERE tbl_submitted_igcf_details_id = ?";

  // Execute the query with the provided id
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching data from tbl_part_two_igcf:", err);
      res
        .status(500)
        .json({ error: "Error fetching data from tbl_part_two_igcf" });
      return;
    }

    // If there are no errors, send the results back as a response
    res.status(200).json(results);
  });
});

server.get("/api/get/igcf-part-two-by-dept", (req, res) => {
  const { dept } = req.query;

  let sql = `SELECT *
    FROM tbl_part_two_igcf pt
    INNER JOIN tbl_igcf_submission_history sh ON pt.tbl_submitted_igcf_details_id = sh.id`;

  // Add a WHERE clause to filter by department if 'dept' query parameter is provided
  if (dept) {
    sql += ` WHERE sh.emp_dept = ?`;
  }

  db.query(sql, [dept], (err, result) => {
    if (err) {
      console.error("Error fetching IGCF part two data:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const igcfPartTwoData = result;
    res.json(igcfPartTwoData);
  });
});
