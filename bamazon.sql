DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
	item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(10,2) DEFAULT 0,
	PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Map of The Soul:PERSONA", "Music", 15.60, 40, 1100), ("Harry Potter and the Sorcerer's Stone", "Movies", 7.99, 35, 2350), 
		   ("Samsung Galaxy S10", "Electronics", 499.99, 4, 3500), ("Teddy Bear", "Toys", 19.99, 100, 1480), 
		   ("First Aid Kit", "Household", 14.99, 75, 1648.28), ("High Waist Yoga Pants", "Clothes", 16.99, 50, 2380), 
       ("Heavy Duty Screws", "Hardware", 16.99, 300, 1200), ("Tradmill", "Sports Equipment", 999.99, 3, 2300), 
       ("New Apple iMac", "Electronics", 1299.99, 25, 8000), ("Lover", "Music", 11.73, 17, 1100);

CREATE TABLE departments (
	department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(100) NULL,
  over_head_costs DECIMAL(10,2) NULL,
  PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Music", 2000), ("Movies", 2000), ("Electronics", 10000), ("Toys", 2000), ("Household", 1000), ("Clothes", 1000), ("Hardware", 500),
			 ("Sports Equipment", 1300);


SELECT * FROM products;
SELECT * FROM departments;

SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales,
	SUM(product_sales) - over_head_costs AS total_profit
FROM departments
INNER JOIN products
ON departments.department_name = products.department_name
GROUP BY department_id;