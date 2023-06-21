-- Insert departments
INSERT INTO departments (name) VALUES
    ('Finance'),
    ('Engineering'),
    ('Legal'),
    ('Entertainment');


-- Insert roles
INSERT INTO roles (title, salary, department_id) VALUES
  ('Salesperson', 80000.00, 4),
  ('Software Engineer', 245000.00, 2),
  ('Lawyer', 500000.00, 3),
  ('Actor', 1500000.00, 3);

-- Insert employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Ryan', 'Thomas', 4, 3),
('Grace', 'Jackson', 2, 4),
('Andrew', 'White', 2, 4);


