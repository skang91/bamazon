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

// Welcome message
connection.connect(function(error){
	if (error) throw error;
	console.log("\n-----------------------------------------------------------------" 
		+ "\nWelcome to Bamazon! What can we help you with today?\n" 
		+ "-----------------------------------------------------------------\n");
	welcome();
});

// first message
function welcome() {
	inquirer.prompt([
		{
			name: "action",
			type: "list",
			choices: ["View items for sale", "Leave the store"],
			message: "Please select one of the following options: "
		}
	]).then(function(action) {
		// 1. view action
		if (action.action === "View items for sale") {
			viewItems();
		// 2. leave action
		} else if (action.action === "Leave the store") {
			exit();
		}
	});
}

// view items function
function viewItems() {
	var query = "SELECT * FROM products";
	connection.query(query, function(error, results) {
		if (error) throw error;
		
		// console table function
		consoleTable(results);
		//ask for id
		inquirer.prompt([
			{
				name: "id",
				message: "Please enter the ID of the item.",
				
				// the number of items
				validate: function(value) {
					if (value > 0 && isNaN(value) === false && value <= results.length) {
						return true;
					}
					return false;
				}
			},
			{
				name: "qty",
				message: "What quantity would you like to purchase?",
				
				// validate value greater than 0
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			}
		]).then(function(transaction) {
			var itemQty;
			var itemPrice;
			var itemName;
			var productSales;
			for (var j = 0; j < results.length; j++) {
				if (parseInt(transaction.id) === results[j].item_id) {
					itemQty = results[j].stock_quantity;
					itemPrice = results[j].price;
					itemName = results[j].product_name;
					productSales = results[j].product_sales;
				}
			}

			//quantity insufficient message
			if (parseInt(transaction.qty) > itemQty) {
				console.log("\nInsufficient quantity! " 
					+ itemQty + " in stock. Try again.\n");
				welcome();
			} 

			// purchase successfully message
			else if (parseInt(transaction.qty) <= itemQty) {
				console.log("\nCongrats! You successfully purchased " + transaction.qty 
					+ " of " + itemName + ".");
				lowerQty(transaction.id, transaction.qty, itemQty, itemPrice);
				salesRevenue(transaction.id, transaction.qty, productSales, itemPrice);
			}
		});
	});
}

// function items table 
function consoleTable(results) {
	var values = [];
	for (var i = 0; i < results.length; i++) {
		var resultObject = {
			ID: results[i].item_id,
			Item: results[i].product_name,
			Price: "$" + results[i].price
		};
		values.push(resultObject);
	}
	// Items for Sale table
	console.table("\nItems for Sale", values);
}

// stock qty function
function lowerQty(item, purchaseQty, stockQty, price) {

	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty - parseInt(purchaseQty)
			},
			{
				item_id: parseInt(item)
			}
		],
	
		function(error, response) {
			if (error) throw error;
	});
}

// sales rev function
function salesRevenue(item, purchaseQty, productSales, price) {
	var customerCost = parseInt(purchaseQty) * price;
	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				product_sales: productSales + customerCost
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(error, response) {
			if (error) throw error;
			// fianl sale message
			console.log("The total price is $" + customerCost.toFixed(2) 
				+ ". Thanks for you purchase!\n");
			welcome();
	});
}

// exit function
function exit() {
	console.log("\nThank you! Have a good day.");
	connection.end();
}