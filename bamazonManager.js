var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var table = new Table({
    head: ['ID', 'Product Name', 'Price', 'Quantity']

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

function afterConnection() {

    getInput();

}

const questions = [
    {
        type: "list",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
        name: "command"
    }
]

const addInvQuestions = [
    {
        type: "input",
        message: "Enter the ID of the item you would like to stock:",
        name: "item_id"
    },
    {
        type: "input",
        message: "How many would you like to add to the stock?:",
        name: "quantity"
    }
]

const addProductQuestions = [
    {
        type: "input",
        message: "Enter the name of the new product:",
        name: "name"
    },
    {
        type: "input",
        message: "Enter the department of the new product:",
        name: "department"
    },
    {
        type: "input",
        message: "Enter the price of the new product:",
        name: "price"
    },
    {
        type: "input",
        message: "Enter the number of units in stock of the new product:",
        name: "stock"
    }
]


function getInput() {
    inquirer
        .prompt(questions)
        .then(function (inquirerResponse) {
            switch (inquirerResponse.command) {
                case "View Products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    addProduct();
                    break;
                default:
                    console.log("That selection is not supported");
            }
        });
}

function viewProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;

        res.forEach(function (row) {
            table.push([row.item_id, row.product_name, row.price, row.stock_quantity]);
        })

        console.log(table.toString());
        connection.end();
    })
}

function lowInventory() {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5',

        function (err, res) {
            if (err) throw err;

            res.forEach(function (row) {
                table.push([row.item_id, row.product_name, row.price, row.stock_quantity]);
            })

            console.log(table.toString());
            connection.end();
        })
}



function addInventory() {
    inquirer.prompt(addInvQuestions).then(function (inquirerResponse) {
        connection.query('SELECT stock_quantity FROM products WHERE ?',
            { item_id: inquirerResponse.item_id },
            function (err, res) {
                if (err) throw err;
                currQuantity = res[0].stock_quantity;
                newQuantity = currQuantity * 1 + inquirerResponse.quantity * 1;
                updateStock(newQuantity);
            });

        function updateStock(quantity) {
            connection.query('UPDATE products SET ? WHERE ? ',
                [{ stock_quantity: quantity },
                { item_id: inquirerResponse.item_id }],
                function (err, res2) {
                    if (err) throw err;
                    console.log("Stock updated");
                    connection.end();
                })
        }
    });
}

function addProduct() {
    inquirer.prompt(addProductQuestions).then(function (inquirerResponse) {

        connection.query('INSERT INTO products SET ?',
            {
                product_name: inquirerResponse.name,
                department_name: inquirerResponse.department,
                price: inquirerResponse.price * 1,
                stock_quantity: inquirerResponse.stock * 1
            }
            ,
            function (err, res) {
                if (err) throw err;
                console.log("Product has been added to the database.")
                connection.end();
            });
    })
}
