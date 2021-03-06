var inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTableNPM = require("console.table");

// MYSQL connection
var pw = require("./pw.js");
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: pw.pw,
	database: "bamazon_db"
});

// Welcome message to Supervisor
connection.connect(function(error){
	if (error) throw error;
	console.log("\n-----------------------------------------------------------------" 
		+ "\nWelcome Bamazon Supervisor!\n" 
		+ "-----------------------------------------------------------------\n");
	welcome();
});

// first message for Supervisor
function welcome() {
	inquirer.prompt([
		{
			name: "action",
			type: "list",
			choices: ["View Product Sales By Department", "Create New Department", "Exit"],
			message: "Please select one of the following options:"
		},
	]).then(function(response) {
		if (response.action === "View Product Sales By Department") {
			viewSales();
		} else if (response.action === "Create New Department") {
			createDepartment();
		} else if (response.action === "Exit") {
			exit();
		}
	});
}

// VIEW PRODUCT SALES BY DEPARTMENT
function viewSales() {
	var joinQuery = "SELECT department_id, departments.department_name, over_head_costs,"
		+ " SUM(product_sales) AS product_sales," 
		+ " SUM(product_sales) - over_head_costs AS total_profit ";
	joinQuery += "FROM departments INNER JOIN products ";
	joinQuery += "ON departments.department_name = products.department_name ";
	joinQuery += "GROUP BY department_id ";

	connection.query(joinQuery, function(error, results) {
		if (error) throw error;
		consoleTableProfit("\nDepartmental Profit", results);
		welcome();
	});
}

// CREATE NEW DEPARTMENT
function createDepartment() {
	connection.query("SELECT * FROM departments", function (error, results) {
		if (error) throw error;
		consoleTableDept("\nCurrent Department Data", results);
		inquirer.prompt([
			{
				name: "name",
				message: "Input new department name.",
				validate: function(value) {
					var deptArray = [];
					for (var i = 0; i < results.length; i++) {
						deptArray.push(results[i].department_name.toLowerCase());
					}
					if (deptArray.indexOf(value.toLowerCase()) === -1) {
						return true;
					}
					return false;
				}
			},
			{
				name: "overhead",
				message: "Input new department overhead costs.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0) {
						return true;
					}
					return false;
				}
			}
		]).then(function(newDept) {
			connection.query(
				"INSERT INTO departments SET ?",
				{
					department_name: newDept.name,
					over_head_costs: parseFloat(newDept.overhead).toFixed(2)
				}, 
				function(error, results) {
					if (error) throw error;
					console.log("\nNew department added successfully.\n");
					welcome();
			});
		});
	});
}

// TOTAL_PROFIT
function consoleTableProfit(title, results) {
	var values = [];
	for (var i = 0; i < results.length; i++) {
		var resultObject = {
			ID: results[i].department_id,
			Department: results[i].department_name,
			over_head_costs: "$" + results[i].over_head_costs.toFixed(2),
			product_sales: "$" + results[i].product_sales.toFixed(2),
			total_profit: "$" + results[i].total_profit.toFixed(2)
		};
		values.push(resultObject);
	}
	console.table(title, values);
}

// console table for adding new dept
function consoleTableDept(title, results) {
	var values = [];
	for (var i = 0; i < results.length; i++) {
		var resultObject = {
			ID: results[i].department_id,
			Department: results[i].department_name,
			over_head_costs: "$" + results[i].over_head_costs.toFixed(2),
		};
		values.push(resultObject);
	}
	console.table(title, values);
}

// exit function
function exit() {
	console.log("\nThank you.");
	connection.end();
}