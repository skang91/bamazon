
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

// Welcome message to manager
connection.connect(function(error){
	if (error) throw error;
	console.log("\n-----------------------------------------------------------------" 
		+ "\nWelcome Bamazon Manager!\n" 
		+ "-----------------------------------------------------------------\n");
	welcome();
});


// first message for manager
function welcome() {
	inquirer.prompt([
		 {
		 	name: "action",
		 	type: "list",
		 	choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", 
		 		"Add New Product", "Exit"],
		 	message: "Please select one of the following options:"
		 }
	]).then(function(answer) {
		if (answer.action === "View Products for Sale") {
			viewProducts();
		} else if (answer.action === "View Low Inventory") {
			viewLowInventory();
		} else if (answer.action === "Add to Inventory") {
			addToInventory();
		} else if (answer.action === "Add New Product") {
			addNewProduct();
		} else if (answer.action === "Exit") {
			exit();
		}
	})
}

// VIEW PRODUCTS FOR SALE
function viewProducts() {
	var query = "SELECT * FROM products";
	connection.query(query, function(error, results) {
		if (error) throw error;
		consoleTable("\nAll Products For Sale", results);
		welcome();
	});
}

// VIEW LOW INVENTORY
function viewLowInventory() {
	var query = "SELECT * FROM products WHERE stock_quantity<5";
	connection.query(query, function(error, results) {
		if (error) throw error;
		consoleTable("\nLow Product Inventory Data", results);
		welcome();
	});
}

// ADD TO INVENTORY
function addToInventory() {
	connection.query("SELECT * FROM products", function (error, results) {
		if (error) throw error;
		consoleTable("\nCurrent Inventory Data", results);
		// add more prompt
		inquirer.prompt([
			{
				name: "id",
				message: "Input the item ID to increase inventory on.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0 && value <= results.length) {
						return true;
					}
					return false;
				}
			},
			{
				name: "amount",
				message: "Input the amount to increase inventory by.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0) {
						return true;
					}
					return false;
				}
			}
		]).then(function(answer) {
			
			// init item qty var
			var itemQty;
			for (var i = 0; i < results.length; i++) {
				if (parseInt(answer.id) === results[i].item_id) {
					itemQty = results[i].stock_quantity;
				}
			}
			increaseQty(answer.id, itemQty, answer.amount);
		});
	});
}

// increase qty function for add to inventory
function increaseQty(item, stockQty, addQty) {
	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty + parseInt(addQty)
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(error, results) {
			if (error) throw error;
			console.log("\nInventory successfully increased.\n");
			welcome();
	});
}

// ADD NEW PRODUCT
function addNewProduct() {
	connection.query("SELECT * FROM departments", function (error, results) {
		// collect item data first
		inquirer.prompt([
			{
				name: "item",
				message: "Input new item to add."
			},
			{
				name: "department",
				type: "list",
				choices: function() {
					var deptArray = [];
					for (var i = 0; i < results.length; i++) {
						deptArray.push(results[i].department_name);
					}
					return deptArray;
				},
				message: "Which department does this item belong in?"
			},
			{
				name: "price",
				message: "How much does this item cost?",

				validate: function(value) {
					if (value >= 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			},
			{
				name: "inventory",
				message: "How much inventory do we have?",
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}			
			}
		]).then(function(newItem) {
			addItemToDb(newItem.item, newItem.department, 
				parseFloat(newItem.price).toFixed(2), parseInt(newItem.inventory));
		});
	});
}

// add item function
function addItemToDb(item, department, price, quantity) {
	connection.query(
		"INSERT INTO products SET ?", 
		{
			product_name: item,
			department_name: department,
			price: price,
			stock_quantity: quantity
		},
		function(error, results) {
			if (error) throw error;
			console.log("\nNew product successfully added.\n");
			welcome();
	});
}

// console table function
function consoleTable(title, results) {
	var values = [];
	for (var i = 0; i < results.length; i++) {
		var resultObject = {
			ID: results[i].item_id,
			Item: results[i].product_name,
			Price: "$" + results[i].price,
			Inventory: results[i].stock_quantity + " units"
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