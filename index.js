const { query } = require("express");
const express = require("express");
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "127.0.0.1",
    // MySQL username,
    user: "root",
    password: "beebs",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

// Query database to show employees' information
// db.query("SELECT employee.first_name, employee.last_name, employee.role_id FROM employee INNER JOIN roles ON employee.role_id = roles.id", function (err, res) {
//   console.log(res);
//   console.table(res);
// });

db.connect((err) => {
  if (err) throw err;
  beginPrompts();
});

async function beginPrompts() {
  const begin = [
    {
      type: "list",
      message: "What would you like to do?",
      name: "begin",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update An Employee Role",
        "Exit",
      ],
    },
  ];
  const userBegin = await inquirer.prompt(begin);
  switch (userBegin.begin) {
    case "View All Departments":
      viewDepartments();
      break;
    case "View All Roles":
      viewRoles();
      break;
    case "View All Employees":
      viewEmployees();
      break;
    case "Add Department":
      addDepartment();
      break;
    case "Add Role":
      addRole();
      break;
    case "Add Employee":
      addEmployee();
      break;
    case "Update An Employee Role":
      updateRole();
      break;
    case "Exit":
      db.end(); //need to figure out what this is supposed to do
      break;
  }
};

function viewDepartments() {
  const departments = `SELECT department.name FROM department`;
  db.query(departments, (err, res) => {
    if (err) throw err;
    console.log('ALL DEPARTMENTS:');
    console.table(res);
    beginPrompts();
    
  })
}

function viewRoles() {
  const roles = `SELECT roles.title, roles.salary FROM roles`;
  db.query(roles, (err, res) => {
    if(err) throw err;
    console.log('ALL ROLES:');
    console.table(res);
    beginPrompts();

  })
}


// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// SELECT movies.movie_name AS movie, reviews.review
// FROM reviews
// LEFT JOIN movies
// ON reviews.movie_id = movies.id
// ORDER BY movies.movie_name;

// FROM employee JOIN roles ON employee.role_id = roles.id
