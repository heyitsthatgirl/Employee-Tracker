const express = require("express");
const mysql = require("mysql2");
require('console.table');

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
db.query("SELECT employee.first_name, employee.last_name, employee.role_id FROM employee JOIN roles ON employee.role_id = roles.title", function (err, res) {
  console.log(res);
  console.table(res);
});

// db.query("SELECT employee.first_name AS id, RIGHT JOIN roles ON employee.role_id = roles.id", function (err, res) {
//     console.log(res);
//   });

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