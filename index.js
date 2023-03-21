// import necessary packages and modules
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

// if the database is connected, start asking questions
db.connect((err) => {
  if (err) throw err;
  beginPrompts();
});

// main menu prompts
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
}

// function to return all department names from the database
function viewDepartments() {
  const departments = `SELECT department.name FROM department`;
  db.query(departments, (err, res) => {
    if (err) throw err;
    console.log("ALL DEPARTMENTS:");
    console.table(res);
    beginPrompts();
  });
}

// function to return all the roles from the database
function viewRoles() {
  const roles = `SELECT roles.title, roles.salary FROM roles`;
  db.query(roles, (err, res) => {
    if (err) throw err;
    console.log("ALL ROLES:");
    console.table(res);
    beginPrompts();
  });
}

// function to return all the employees from the database
function viewEmployees() {
  const employees = `SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN roles ON (roles.id = employee.role_id)
  INNER JOIN department ON (department.id = roles.department_id)
  ORDER BY employee.id;`;
  db.query(employees, (err, res) => {
    if (err) throw err;
    console.log("ALL EMPLOYEES:");
    console.table(res);
    beginPrompts();
  });
}

// function to add a new department to the department table
async function addDepartment() {
  const depIdPrompt = [
    {
      type: "input",
      message: "Please provide a new Department ID number",
      name: "depID",
    },
  ];

  const newID = await inquirer.prompt(depIdPrompt);
  const ID = newID.depID;

  const depNamePrompt = [
    {
      type: "input",
      message: "What is the name of the new Department",
      name: "depName",
    },
  ];

  const newDep = await inquirer.prompt(depNamePrompt);
  const name = newDep.depName;

  const addDep = `INSERT INTO department (id, name)
  VALUES  (${ID}, "${name}")`;

  db.query(addDep, (err, res) => {
    if (err) throw err;
    console.log("NEW DEPARTMENT ADDED");
    viewDepartments();
  });
}
// function to add a role
async function addRole() {
  const rolePrompt = [
    {
      type: "input",
      message: "Please provide an ID for the new Role:",
      name: "id",
    },
    {
      type: "input",
      message: "Please provide a title for the new Role:",
      name: "title",
    },
    {
      type: "input",
      message: "Please provide a salary for the new Role:",
      name: "salary",
    },
    {
      type: "input",
      message: "Please identify the ID of the Department this Role belongs to:",
      name: "department",
    },
  ];

  const newRole = await inquirer.prompt(rolePrompt);
  const id = newRole.id;
  const title = newRole.title;
  const salary = newRole.salary;
  const department = newRole.department;

  const addRole = `INSERT INTO roles (id, title, salary, department_id)
  VALUES (${id}, "${title}", "${salary}", ${department})`;

  db.query(addRole, (err, res) => {
    if (err) throw err;
    console.log("NEW ROLE ADDED");
    viewRoles();
  });
}

// function to add an employee
async function addEmployee() {

  const employeePrompt = [
    {
      type: "input",
      message: "Please provide an ID for the new Employee:",
      name: "id",
    },
    {
      type: "input",
      message: "What is the new Employee's first name?",
      name: "firstName",
    },
    {
      type: "input",
      message: "What is the new Employee's last name?",
      name: "lastName",
    },
    {
      type: "input",
      message: "Employee Role ID:",
      name: "role",
    },
    {
      type: "input",
      message: "Employee Manager ID:",
      name: "manager",
    },
  ];

  const newEmp = await inquirer.prompt(employeePrompt);
  const id = newEmp.id;
  const firstName = newEmp.firstName;
  const lastName = newEmp.lastName;
  const role = newEmp.role;
  const manager = newEmp.manager;

  const addEmp = `INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
  VALUES (${id}, "${firstName}", "${lastName}", ${role}, ${manager})`

  db.query(addEmp, (err, res) => {
    if(err) throw err,
    console.log("NEW EMPLOYEE ADDED");
    viewEmployees();
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
