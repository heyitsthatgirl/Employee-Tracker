INSERT INTO department (id, name)
VALUES  (1, "Sales"),
        (2, "Legal"),
        (3, "Public Relations"),
        (4, "Logistics");

INSERT INTO roles (id, title, salary, department_id)
VALUES (1, "Salesperson", 100000, 1),
        (2, "Sales Lead", 120000, 1),
        (3, "Lawyer", 300000, 2),
        (4, "Legal Team Lead", 350000, 2),
        (5, "Officer", 500000, 3),
        (6, "Director", 400000, 3),
        (7, "Administrator", 300000, 3),
        (8, "Technician", 80000, 4),
        (9, "Coordinator", 80000, 4),
        (10, "Analyst", 80000, 4),
        (11, "Director of Operations", 200000, 4);
        
        INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
        VALUES (001, "Fozzy", "Bear", 5, null),
        (002, "Gonzo", "de Great", 6, 001),
        (003, "Camilla", "Pollo", 7, 002);