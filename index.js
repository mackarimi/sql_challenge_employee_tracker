// import mysql and inquirer
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("dotenv").config();

// validate that the user entered a value
const validateInput = (input) => {
  if (input) {
    return true;
  } else {
    console.log("Please enter a value!");
    return false;
  }
};

// Create a connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mazary@zahid1412133",
  database: "employee_tracker_database",
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");

  // Start the application
  startApplication();
});

// Start the application
function startApplication() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add A Department",
        "Add A Role",
        "Add An Employee",
        "Update An Employee Role",
        "Update An Employee Manager",
        "View Employees By Manager",
        "View Employees By Department",
        "Delete Data",
        "View Department Budget",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add A Department":
          addDepartment();
          break;
        case "Add A Role":
          addRole();
          break;
        case "Add An Employee":
          addEmployee();
          break;
        case "Update An Employee Role":
          updateEmployeeRole();
          break;
        case "Update An Employee Manager":
          updateEmployeeManager();
          break;
        case "View Employees By Manager":
          viewEmployeesByManager();
          break;
        case "View Employees By Department":
          viewEmployeesByDepartment();
          break;
        case "Delete Data":
          deleteData();
          break;
        case "View Department Budget":
          viewDepartmentBudget();
          break;
        case "Exit":
          end();
          break;
        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
}

// View all departments
function viewAllDepartments() {
    connection.query("SELECT DISTINCT name FROM departments", (err, results) => {
      if (err) {
        console.error("Error retrieving departments:", err);
      } else {
        console.log("Departments:");
        console.table(results);
      }
      startApplication();
    });
  }
  

// View all roles
function viewAllRoles() {
  connection.query(
    "SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles JOIN departments ON roles.department_id = departments.id",
    (err, results) => {
      if (err) {
        console.error("Error retrieving roles:", err);
      } else {
        console.log("Roles:");
        console.table(results);
      }
      startApplication();
    }
  );
}

// View all employees
function viewAllEmployees() {
  connection.query(
    "SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role, roles.salary, departments.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id",
    (err, results) => {
      if (err) {
        console.error("Error retrieving employees:", err);
      } else {
        console.log("Employees:");
        console.table(results);
      }
      startApplication();
    }
  );
}

// Add a department
function addDepartment() {
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Enter the name of the department:",
      validate: validateInput,
    })
    .then((answer) => {
      connection.query(
        "INSERT INTO departments SET ?",
        { name: answer.name },
        (err) => {
          if (err) {
            console.error("Error adding department:", err);
          } else {
            console.log("Department added successfully!");
          }
          startApplication();
        }
      );
    });
}

// Add a role
function addRole() {
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "Enter the title of the role:",
        validate: validateInput,
      },
      {
        name: "salary",
        type: "number",
        message: "Enter the salary for the role:",
        validate: validateInput,
      },
      {
        name: "departmentId",
        type: "number",
        message: "Enter the department ID for the role:",
        validate: validateInput,
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO roles SET ?",
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId,
        },
        (err) => {
          if (err) {
            console.error("Error adding role:", err);
          } else {
            console.log("Role added successfully!");
          }
          startApplication();
        }
      );
    });
}

// Add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter the first name of the employee:",
        validate: validateInput,
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter the last name of the employee:",
        validate: validateInput,
      },
      {
        name: "roleId",
        type: "number",
        message: "Enter the role ID for the employee:",
        validate: validateInput,
      },
      {
        name: "managerId",
        type: "number",
        message: "Enter the manager ID for the employee (optional):",
      },
    ])
    .then((answer) => {
      const employee = {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: answer.roleId,
      };

      if (answer.managerId) {
        employee.manager_id = answer.managerId;
      }

      connection.query("INSERT INTO employees SET ?", employee, (err) => {
        if (err) {
          console.error("Error adding employee:", err);
        } else {
          console.log("Employee added successfully!");
        }
        startApplication();
      });
    });
}

// Update an employee role
function updateEmployeeRole() {
  connection.query("SELECT * FROM employees", (err, employees) => {
    if (err) {
      console.error("Error retrieving employees:", err);
      startApplication();
      return;
    }

    inquirer
      .prompt([
        {
          name: "employeeId",
          type: "list",
          message: "Select the employee you want to update:",
          choices: employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
        {
          name: "roleId",
          type: "number",
          message: "Enter the new role ID for the employee:",
          validate: validateInput,
        },
      ])
      .then((answer) => {
        connection.query(
          "UPDATE employees SET ? WHERE ?",
          [{ role_id: answer.roleId }, { id: answer.employeeId }],
          (err) => {
            if (err) {
              console.error("Error updating employee role:", err);
            } else {
              console.log("Employee role updated successfully!");
            }
            startApplication();
          }
        );
      });
  });
}

// Update an employee manager
function updateEmployeeManager() {
  connection.query("SELECT * FROM employees", (err, employees) => {
    if (err) {
      console.error("Error retrieving employees:", err);
      startApplication();
      return;
    }

    inquirer
      .prompt([
        {
          name: "employeeId",
          type: "list",
          message: "Select the employee you want to update:",
          choices: employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
        {
          name: "managerId",
          type: "number",
          message: "Enter the new manager ID for the employee:",
          validate: validateInput,
        },
      ])
      .then((answer) => {
        connection.query(
          "UPDATE employees SET ? WHERE ?",
          [{ manager_id: answer.managerId }, { id: answer.employeeId }],
          (err) => {
            if (err) {
              console.error("Error updating employee manager:", err);
            } else {
              console.log("Employee manager updated successfully!");
            }
            startApplication();
          }
        );
      });
  });
}

// View employees by manager
function viewEmployeesByManager() {
  connection.query(
    "SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, employees.id, employees.first_name, employees.last_name, roles.title AS role, roles.salary, departments.name AS department FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id ORDER BY manager",
    (err, results) => {
      if (err) {
        console.error("Error retrieving employees by manager:", err);
      } else {
        console.log("Employees by Manager:");
        console.table(results);
      }
      startApplication();
    }
  );
}

// View employees by department
function viewEmployeesByDepartment() {
  connection.query(
    "SELECT departments.name AS department, employees.id, employees.first_name, employees.last_name, roles.title AS role, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id ORDER BY department",
    (err, results) => {
      if (err) {
        console.error("Error retrieving employees by department:", err);
      } else {
        console.log("Employees by Department:");
        console.table(results);
      }
      startApplication();
    }
  );
}

// Delete data
function deleteData() {
  inquirer
    .prompt({
      name: "deleteOption",
      type: "list",
      message: "Select the type of data you want to delete:",
      choices: ["Departments", "Roles", "Employees"],
    })
    .then((answer) => {
      switch (answer.deleteOption) {
        case "Departments":
          deleteDepartments();
          break;
        case "Roles":
          deleteRoles();
          break;
        case "Employees":
          deleteEmployees();
          break;
        default:
          console.log(`Invalid delete option: ${answer.deleteOption}`);
          startApplication();
          break;
      }
    });
}

// Delete departments
function deleteDepartments() {
  connection.query("SELECT * FROM departments", (err, departments) => {
    if (err) {
      console.error("Error retrieving departments:", err);
      startApplication();
      return;
    }

    inquirer
      .prompt({
        name: "departmentId",
        type: "list",
        message: "Select the department you want to delete:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      })
      .then((answer) => {
        connection.query(
          "DELETE FROM departments WHERE ?",
          { id: answer.departmentId },
          (err) => {
            if (err) {
              console.error("Error deleting department:", err);
            } else {
              console.log("Department deleted successfully!");
            }
            startApplication();
          }
        );
      });
  });
}

// Delete roles
function deleteRoles() {
  connection.query("SELECT * FROM roles", (err, roles) => {
    if (err) {
      console.error("Error retrieving roles:", err);
      startApplication();
      return;
    }

    inquirer
      .prompt({
        name: "roleId",
        type: "list",
        message: "Select the role you want to delete:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      })
      .then((answer) => {
        connection.query(
          "DELETE FROM roles WHERE ?",
          { id: answer.roleId },
          (err) => {
            if (err) {
              console.error("Error deleting role:", err);
            } else {
              console.log("Role deleted successfully!");
            }
            startApplication();
          }
        );
      });
  });
}

// Delete employees
function deleteEmployees() {
  connection.query("SELECT * FROM employees", (err, employees) => {
    if (err) {
      console.error("Error retrieving employees:", err);
      startApplication();
      return;
    }

    inquirer
      .prompt({
        name: "employeeId",
        type: "list",
        message: "Select the employee you want to delete:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      })
      .then((answer) => {
        connection.query(
          "DELETE FROM employees WHERE ?",
          { id: answer.employeeId },
          (err) => {
            if (err) {
              console.error("Error deleting employee:", err);
            } else {
              console.log("Employee deleted successfully!");
            }
            startApplication();
          }
        );
      });
  });
}

// View department budget
function viewDepartmentBudget() {
  connection.query(
    "SELECT departments.name AS department, SUM(roles.salary) AS budget FROM departments JOIN roles ON departments.id = roles.department_id JOIN employees ON roles.id = employees.role_id GROUP BY departments.id",
    (err, results) => {
      if (err) {
        console.error("Error retrieving department budget:", err);
      } else {
        console.log("Department Budget:");
        console.table(results);
      }
      startApplication();
    }
  );
}

// End the application
function end() {
  console.log("Exiting the application");
  connection.end();
}
