const dotenv = require('dotenv');
dotenv.config({path: "./.env.local"});

const fs = require("fs");
const conn = require("./mysqlConnection");

const express = require('express');
const cors = require('cors');
const app = express();

// ================ import routes ===================
const studentsRoute = require("./routes/students");
const teachersRoute = require("./routes/teachers");
const adminsRoute = require("./routes/admins");

const authRoute = require("./routes/auth");


// ================ middlewares ====================
// we do this so that we can access the body of a request like 
// a json object
app.use(express.json());
/* Allows to make cross site requests to the api */
app.use(cors());

// we hook up our predefined routes to their specified urls
app.use('/students', studentsRoute);
app.use('/teachers', teachersRoute);
app.use('/admins', adminsRoute);
app.use("/auth", authRoute);


// ============ server settings ================== 
app.listen(5000);
