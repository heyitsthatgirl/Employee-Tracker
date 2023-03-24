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
    default:
      break;
  }
}

// function to return all department names from the database
function viewDepartments() {
  const departments = `SELECT * FROM department`;
  db.query(departments, (err, res) => {
    if (err) throw err;
    console.log("ALL DEPARTMENTS:");
    console.table(res);
  });
}

// function to return all the roles from the database
function viewRoles() {
  const roles = `SELECT roles.id, roles.title, roles.salary, department.name AS department 
  FROM roles
  INNER JOIN department ON (department.id = roles.department_id)
  ORDER BY roles.id`;
  db.query(roles, (err, res) => {
    if (err) throw err;
    console.log("ALL ROLES:");
    console.table(res);
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
    });
}

// function to add a new department to the department table
async function addDepartment() {
  const depPrompt = [
    {
      type: "input",
      message: "New Department name:",
      name: "name",
    },
  ];

  const newDep = await inquirer.prompt(depPrompt);

  const name = newDep.name;

  const addDep = `INSERT INTO department (name)
  VALUES  ("${name}")`;

  db.query(addDep, (err, res) => {
    if (err) throw err;
    console.log("NEW DEPARTMENT ADDED");
    });
}

// function to add a role
async function addRole() {
  const rolePrompt = [
    {
      type: "input",
      message: "New Role title:",
      name: "title",
    },
    {
      type: "input",
      message: "New Role salary:",
      name: "salary",
    },
    {
      type: "input",
      message: "New Role department ID:",
      name: "department",
    },
  ];

  const newRole = await inquirer.prompt(rolePrompt);

  const title = newRole.title;
  const salary = newRole.salary;
  const department = newRole.department;

  const addRole = `INSERT INTO roles (title, salary, department_id)
  VALUES ("${title}", "${salary}", ${department})`;

  db.query(addRole, (err, res) => {
    if (err) throw err;
    console.log("NEW ROLE ADDED");
  });
}

// function to add an employee
async function addEmployee() {
  const employeePrompt = [
    {
      type: "input",
      message: "Employee's first name:",
      name: "firstName",
    },
    {
      type: "input",
      message: "Employee's last name:",
      name: "lastName",
    },
    {
      type: "input",
      message: "Employee role ID:",
      name: "role",
    },
    {
      type: "input",
      message: "Employee manager ID:",
      name: "manager",
    },
  ];

  const newEmp = await inquirer.prompt(employeePrompt);

  const firstName = newEmp.firstName;
  const lastName = newEmp.lastName;
  const role = newEmp.role;
  const manager = newEmp.manager;

  const addEmp = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES ("${firstName}", "${lastName}", ${role}, ${manager})`;

  db.query(addEmp, (err, res) => {
    if (err) throw (err, console.log("NEW EMPLOYEE ADDED"));
    viewEmployees();
  });
}

// function to update an employee role
async function updateRole() {
  
  const employeesList = `SELECT employee.first_name, employee.last_name, roles.title AS title, roles.salary AS salary FROM employee 
  INNER JOIN roles ON (employee.role_id = roles.id)
  ORDER BY roles.id`;
  db.query(employeesList, async (err, res) => {
    if (err) throw err;
    console.table(res);
    const updatePrompt = [
      {
        type: "list",
        message: "Which Employee would you like to update?",
        choices: () => res.map((res) => res.first_name + " " + res.last_name),
        name: "employee",
      },
    ];

    const userChoice = await inquirer.prompt(updatePrompt);

    const employee = userChoice.employee;
    console.log("You have chosen to update:", employee);

    andThen(employee);
  });
}

async function andThen(employee) {
  console.log(employee);

  // query to return list of roles?
  // if role is chosen update that employee's role to the new role in the database

  db.query("SELECT roles.title FROM roles", async (err, res) => {
    if (err) throw err;
    const whichPrompt = [
      {
        type: "list",
        message: "What role would you like to assign to this employee?",
        name: "whatDo",
        choices: () => res.map((res) => res.title),
      },
    ];
    const choice = await inquirer.prompt(whichPrompt);
    console.log(choice.whatDo);

    const whatDo = choice.whatDo;

    final(employee, whatDo);
  });
}

async function final(employee, whatDo) {
  // console.log(employee, whatDo);
  const getID = `SELECT id FROM roles WHERE roles.title='${whatDo}'`;

  db.query(getID, (err, res) => {
    if (err) throw err;
    const roleID = JSON.stringify(res[0].id);
    console.log(roleID);
    console.log(employee);

    const update = `UPDATE employee SET role_id = ${roleID} WHERE employee.first_name = 'Fozzy'`;

    db.query(update, (err, res) => {
      if (err) throw err;
      console.log(`${employee} updated successfully`);
    });
  });
}

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
