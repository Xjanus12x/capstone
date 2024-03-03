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

// Establish the Port
server.listen(8085, function check(error) {
  if (error) console.log("Error...");
  else console.log("Started... 8085");
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

// add set percentages
server.post("/api/percentages/add", (req, res) => {
  let igcfInformation = {
    dept_name: req.body.dept_name,
    title: req.body.title,
    "set_weight_%": req.body.weightPercentages,
    "set_individual_goal_commitment_%":
      req.body.individualGoalCommitmentPercentages,
    "set_accomplishment_%": req.body.accomplishmentPercentages,
  };
  let sql = "INSERT INTO tbl_igcf_information SET ?";
  db.query(sql, igcfInformation, (error, result) => {
    if (error) {
      res.send({
        status: false,
        message: "IGCF Information  created failed",
      });
    } else {
      res.send({
        status: true,
        message: "IGCF Information created successfully",
        data: result[0],
      });
    }
  });
});

// // fetch users
// server.get("/api/users", (req, res) => {
//   let sql = "SELECT * FROM tbl_users";
//   db.query(sql, function (error, result) {
//     if (error) console.log("Error Connecting to DB");
//     else
//       res.send({
//         status: true,
//         data: result,
//       });
//   });
// });

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

// Login endpoint
server.post("/api/login", (req, res) => {
  const { emp_email, emp_password } = req.body;

  // Validate that emp_email and emp_password are present in the request body
  if (!emp_email || !emp_password) {
    return res
      .status(400)
      .send({ status: false, message: "Invalid request format" });
  }

  // Fetch user data for the provided email
  const sql = "SELECT * FROM tbl_users WHERE emp_email = ?";
  db.query(sql, [emp_email], (error, result) => {
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
    bcrypt.compare(
      emp_password,
      storedPasswordHash,
      (compareErr, passwordMatch) => {
        if (compareErr) {
          console.error("Error comparing passwords:", compareErr);
          return res
            .status(500)
            .send({ status: false, message: "Internal Server Error" });
        } else if (passwordMatch) {
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
      }
    );
  });
});

// End point for checking whether user already exist
server.post("/api/user/check-existence", (req, res) => {
  try {
    const { emp_email } = req.body;

    // Check if the email already exists in the database
    const checkExistenceQuery =
      "SELECT emp_email FROM tbl_users WHERE emp_email = ?";
    db.query(checkExistenceQuery, [emp_email], (error, existingUser) => {
      if (error) {
        console.error("Error checking user existence:", error);
        res
          .status(500)
          .send({ status: false, message: "Internal Server Error" });
      } else {
        // Respond with a boolean indicating whether the user exists
        res.send({ exists: existingUser.length > 0 });
      }
    });
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

// add submitted form data to database
server.post("/api/submit-form", (req, res) => {
  // Destructure the properties from req.body for clarity and easier access
  const {
    emp_fullname,
    emp_number,
    emp_position,
    emp_dept,
    selectedWeightPercentages,
    selectedIndividualGoalCommitmentPercentages,
    selectedCommitmentPercentages,
    emp_set_commitments,
    emp_set_weight_percentage,
    emp_set_igc_percentage,
    emp_set_accomplishment_percentage,
    emp_top_three_least_agc,
    emp_top_three_highly_agc,
    emp_top_three_competencies_improvement,
    emp_top_three_competency_strenghts,
    emp_top_three_training_development_suggestion,
    emp_signature,
  } = req.body;

  // Create the submittedForm object with the extracted properties
  const submittedForm = {
    fullname: emp_fullname,
    emp_number: emp_number,
    emp_position: emp_position,
    emp_dept: emp_dept,
    selected_weight_percentages: selectedWeightPercentages,
    selected_igc_percentages: selectedIndividualGoalCommitmentPercentages,
    selected_commitment_percentages: selectedCommitmentPercentages,
    commitments: emp_set_commitments,
    weight_percentages: emp_set_weight_percentage,
    igc_percentages: emp_set_igc_percentage,
    accomplishment_percentages: emp_set_accomplishment_percentage,
    top_three_least_agc: emp_top_three_least_agc,
    top_three_highly_agc: emp_top_three_highly_agc,
    top_three_competencies_improvement: emp_top_three_competencies_improvement,
    top_three_competency_strenghts: emp_top_three_competency_strenghts,
    top_three_training_development_suggestions:
      emp_top_three_training_development_suggestion,
    rater_signature: emp_signature,
  };

  // Insert submittedForm into the database
  db.query(
    "INSERT INTO tbl_emp_submitted_igcf SET ?",
    submittedForm,
    (err, result) => {
      if (err) {
        console.error("Error inserting form data:", err);
        res.status(500).json({ error: "Error submitting form data" });
      } else {
        console.log("Form data submitted successfully");
        res.status(200).json({ message: "Form data submitted successfully" });
      }
    }
  );
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

//fetch all submitted igcf base on department
server.get("/api/get/all-dept-submitted-igcf", (req, res) => {
  const { emp_dept } = req.query;

  let sql = "SELECT * FROM tbl_emp_submitted_igcf WHERE emp_dept = ?";
  db.query(sql, [emp_dept], function (error, result) {
    if (error) {
      console.error("Error fetching submitted IGCF data:", error);
      res.status(500).send("Error fetching submitted IGCF data");
    } else {
      console.log("Submitted IGCF data fetched successfully:", result);
      res.status(200).json(result);
    }
  });
});

//fetch user submitted igcf
server.get("/api/get/emp-submitted-igcf", (req, res) => {
  const { emp_number } = req.query;

  let sql = "SELECT * FROM tbl_emp_submitted_igcf WHERE emp_number = ?";
  db.query(sql, [emp_number], function (error, result) {
    if (error) {
      console.error("Error fetching submitted IGCF data:", error);
      res.status(500).send("Error fetching submitted IGCF data");
    } else {
      console.log("Submitted IGCF data fetched successfully:", result);
      res.status(200).json(result);
    }
  });
});

// fetch all submitted IGCF in every dept
server.get("/api/get/all-emp-submitted-igcf", (req, res) => {
  let sql = "SELECT * FROM tbl_emp_submitted_igcf";
  db.query(sql, function (error, result) {
    if (error) {
      console.error("Error fetching submitted IGCF data:", error);
      res.status(500).send("Error fetching submitted IGCF data");
    } else {
      console.log("Submitted IGCF data fetched successfully:", result);
      res.status(200).json(result);
    }
  });
});

server.delete("/api/del/submitted-igcf/:id", (req, res) => {
  const id = req.params.id;

  // Perform the DELETE operation in your database
  db.query(
    "DELETE FROM tbl_emp_submitted_igcf WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error deleting row:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      console.log("Row deleted successfully");
      res.status(200).json({ message: "Row deleted successfully" });
    }
  );
});

//get all users
server.get("/api/get/users", (req, res) => {
  // Extract department name from request query parameters
  const { dept_name } = req.query;

  // Construct the SQL query with a WHERE clause to filter by department name
  let sql = `
    SELECT u.emp_email, u.emp_role, u.emp_number, d.emp_firstname, d.emp_lastname, d.emp_position, d.emp_dept, d.emp_signature 
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
