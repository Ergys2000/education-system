const mysql = require("mysql");
const fs = require("fs");

const pool = mysql.createPool({
	waitForConnections: true,
	queueLimit: 500,
	connectionLimit: 20,
	host: process.env.MARIADB_HOST || "localhost",
	user: process.env.MARIADB_USER || "user",
	password: process.env.MARIADB_PASSWORD || "password",
	database: process.env.MARIADB_DB || "education"
});

module.exports = pool;
