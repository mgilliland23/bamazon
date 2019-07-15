var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var table = new Table({
    head: ['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit']
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
        choices: ["View Product Sales by Department", "Create New Department"],
        name: "command"
    }
]

function getInput() {
    inquirer
        .prompt(questions)
        .then(function (inquirerResponse) {
            switch (inquirerResponse.command) {
                case "View Product Sales by Department":
                    viewSales();
                    break;
                case "Create New Department":
                    createDepartment();
                    break;
                default:
                    console.log("That selection is not supported");
            }
        });
}

function viewSales() {
    var Query = "SELECT d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS total_sales ";
    Query += "FROM departments AS d INNER JOIN products AS p ";
    Query += "ON d.department_name = p.department_name GROUP BY d.department_id, d.department_name";
    connection.query(Query, function (err, res) {
        if (err) throw err;
        res.forEach(function (row) {
            var profit = row.total_sales - row.over_head_costs;
            table.push([row.department_id, row.department_name, row.over_head_costs, row.total_sales, profit]);
        });
        console.log(table.toString());
        connection.end();
    });
}

function createDepartment() {

}