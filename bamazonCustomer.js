var mysql = require("mysql");
var inquirer = require("inquirer");

var Table = require('cli-table');


var table = new Table({
    head: ['ID', 'Product Name', 'Price']

});

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "mattg#23",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    afterConnection();
});

var products = [];

function Product(id, name, price, quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
}

function afterConnection() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;

        res.forEach(function (row) {
            //Since already returning all products from DB, create a global array of these products to reduce number of calls to the DB
            var product = new Product(row.item_id, row.product_name, row.price, row.stock_quantity);
            products.push(product);
            table.push([row.item_id, row.product_name, row.price]);

        })
        console.log(table.toString());

        getInput();
        //connection.end();
    })


}

const questions = [
    {
        type: "input",
        message: "Enter the ID of the item you would like to order:",
        name: "item_id"
    },
    {
        type: "input",
        message: "How many would you like to buy?:",
        name: "quantity"
    }
]


function getInput() {
    inquirer
        .prompt(questions)
        .then(function (inquirerResponse) {

            inStock(inquirerResponse.item_id, inquirerResponse.quantity);

        });
}

//Check if there is enough of the item in stock, and then process the order if there is
function inStock(itemID, quantity) {
    if (products[itemID - 1].quantity > quantity) {
        var total = products[itemID - 1].price * quantity;
        //Update the product in the global array
        products[itemID - 1].quantity -= quantity;
        //Push the changes to database
        orderProduct(products[itemID - 1].id, products[itemID - 1].quantity, total);
    }
    else {
        console.log("There aren't that many of this item in stock!");
        connection.end();
    }
}

//Updates the product quantity in the DB and alerts the customer the cost of his/her order
function orderProduct(itemID, quantity, total) {
    connection.query('UPDATE products SET ? WHERE ?', [
        { stock_quantity: quantity },
        { item_id: itemID }
    ],
        function (err, res) {
            if (err) throw err;

            console.log("You're order has been placed!")
            console.log("The grand total is: $" + total);
            connection.end();
        });

}
