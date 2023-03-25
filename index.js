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
        "Add Department",
        "View All Roles",
        "Add Role",
        "View All Employees",
        "Add Employee",
        "Update An Employee Role",
        "Exit",
      ],
    },
  ];

  // wait for user answer
  const userBegin = await inquirer.prompt(begin);

  // invoke a function based on user answer
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
      // end connection to database if user chooses 'Exit'
      db.end();
      console.log("Thank you for using the Employee Tracker!");
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

    // back to main menu
    beginPrompts();
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

    // back to the main menu
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

    // back to the main menu
    beginPrompts();
  });
}

// function to add a new department to the department table
async function addDepartment() {
  // prompt user for department name
  const depPrompt = [
    {
      type: "input",
      message: "New Department name:",
      name: "name",
    },
  ];

  // wait for user answer
  const newDep = await inquirer.prompt(depPrompt);

  const name = newDep.name;

  // query to add new department to database
  const addDep = `INSERT INTO department (name)
  VALUES  ("${name}")`;

  db.query(addDep, (err, res) => {
    if (err) throw err;
    console.log("NEW DEPARTMENT ADDED");

    // back to main menu
    beginPrompts();
  });
}

// function to add a role
async function addRole() {
  // query to get department names from database
  chooseDep = `SELECT name FROM department`;

  db.query(chooseDep, async (err, res) => {
    if (err) throw err;

    // prompt user for new role info
    // use query results to define choices for department prompt
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
        type: "list",
        message: "New Role department:",
        name: "department",
        choices: () => res.map((res) => res.name),
      },
    ];

    // wait for user answers
    const newRole = await inquirer.prompt(rolePrompt);

    const title = newRole.title;
    const salary = newRole.salary;
    const department = newRole.department;

    // query to find id of chosen department
    const findDepId = `SELECT id FROM department WHERE department.name = "${department}"`;

    db.query(findDepId, (err, res) => {
      if (err) throw err;
      const roleDep = JSON.stringify(res[0].id);

      // query to add new role to database
      const addRole = `INSERT INTO roles (title, salary, department_id)
  VALUES ("${title}", "${salary}", ${roleDep})`;

      db.query(addRole, (err, res) => {
        if (err) throw err;
        console.log("NEW ROLE ADDED");

        // back to main menu
        beginPrompts();
      });
    });
  });
}

// function to add an employee
async function addEmployee() {
  // get roles from the database
  db.query(`SELECT roles.title FROM roles`, async (err, res) => {
    if (err) throw err;

    // use the results from the query to define choices in inquirer
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
        type: "list",
        message: "Employee role:",
        name: "role",
        choices: () => res.map((res) => res.title),
      },
    ];

    db.query("SELECT first_name FROM employee", async (err, res) => {
      if (err) throw err;

      const managerPrompt = [
        {
          type: "list",
          message: "Employee manager:",
          name: "manager",
          choices: () => res.map((res) => res.first_name),
        },
      ];

      // await the answers
      const newEmp = await inquirer.prompt(employeePrompt);
      const managerChoice = await inquirer.prompt(managerPrompt);

      const firstName = newEmp.firstName;
      const lastName = newEmp.lastName;
      const role = newEmp.role;
      const manager = managerChoice.manager;

      // query to find the id of the role chosen from the prompts
      const findRoleId = `SELECT roles.id FROM roles WHERE roles.title = "${role}"`;

      db.query(findRoleId, (err, res) => {
        if (err) throw err;
        const roleID = JSON.stringify(res[0].id);

        // query to get the employee id from the manager chosen
        const findManId = `SELECT employee.id FROM employee WHERE employee.first_name = "${manager}"`;

        db.query(findManId, (err, res) => {
          if (err) throw err;

          const managerId = JSON.stringify(res[0].id);

          // query to add insert the new employee into the database
          const addEmp = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES ("${firstName}", "${lastName}", "${roleID}", ${managerId})`;

          db.query(addEmp, (err, res) => {
            if (err) throw err;
            console.log("NEW EMPLOYEE ADDED");

            // back to main menu
            beginPrompts();
          });
        });
      });
    });
  });
}

// functions to update an employee role
// updateRole lets user select which employee they want to update
async function updateRole() {
  // query to select the employees and their roles
  const employeesList = `SELECT employee.first_name, employee.last_name, roles.title AS title FROM employee 
  INNER JOIN roles ON (employee.role_id = roles.id)
  ORDER BY roles.id`;
  db.query(employeesList, async (err, res) => {
    if (err) throw err;
    // display the employees so user can review the data
    console.table(res);
    const updatePrompt = [
      {
        type: "list",
        message: "Which Employee would you like to update?",
        choices: () => res.map((res) => res.first_name),
        name: "employee",
      },
    ];

    // wait on answers from user
    const userChoice = await inquirer.prompt(updatePrompt);

    const employee = userChoice.employee;
    console.log("You have chosen to update:", employee);

    // next function
    andThen(employee);
  });
}

// remembers the chosen employee and asks user which role they want to assign
async function andThen(employee) {
  // query to get all the roles from the database
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

    // wait for user answer
    const choice = await inquirer.prompt(whichPrompt);

    const whatDo = choice.whatDo;

    // next function
    final(employee, whatDo);
  });
}

// takes in the chosen employee and the chosen role
// gets the id of the chosen role and updates the employee.role_id in the database
async function final(employee, whatDo) {
  // query to get the id of the chosen role
  const getID = `SELECT id FROM roles WHERE roles.title='${whatDo}'`;

  db.query(getID, (err, res) => {
    if (err) throw err;
    const roleID = JSON.stringify(res[0].id);

    // query to update the employee in the database
    const update = `UPDATE employee SET role_id = ${roleID} WHERE employee.first_name = '${employee}'`;

    db.query(update, (err, res) => {
      if (err) throw err;
      console.log(`${employee} updated successfully`);

      // back to the main menu
      beginPrompts();
    });
  });
}

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// shows app is listening
app.listen(PORT, () => {
  console.log("Welcome to the Employee Tracker!");
});
