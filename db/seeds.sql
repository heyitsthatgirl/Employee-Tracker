INSERT INTO department (name)
VALUES  ("Sales"),
        ("Legal"),
        ("Public Relations"),
        ("Logistics");

INSERT INTO roles (title, salary, department_id)
VALUES  ("Salesperson", 100000, 1),
        ("Sales Lead", 120000, 1),
        ("Lawyer", 300000, 2),
        ("Legal Team Lead", 350000, 2),
        ("Officer", 500000, 3),
        ("Director", 400000, 3),
        ("Coordinator", 80000, 4),
        ("Analyst", 80000, 4);
        
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Fozzy", "Bear", 5, null),
        ("Yogi", "Behr", 6, 1),
        ("Paddington", "Bare", 8, 2),
        ("Winnie P.", "Berr", 2, null);
