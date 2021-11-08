const mysql = require("mysql");
const fs = require("fs");

const pool = mysql.createPool({
	waitForConnections: true,
	queueLimit: 500,
	connectionLimit: 20,
	host: process.env.MARIADB_HOST,
	user: process.env.MARIADB_USER,
	password: process.env.MARIADB_PASSWORD,
	database: process.env.MARIADB_DB
});

module.exports = pool;
