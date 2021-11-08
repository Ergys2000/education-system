const express = require("express");
const jwt = require("jsonwebtoken");
const authHandler = require("../handlers/authentication");

const router = express.Router();

router.get("/auth_student",
	authHandler.validateStudent,
	authHandler.createToken,
	authHandler.deletePrevUserTokens,
	authHandler.insertJwtToken);

router.get("/auth_teacher",
	authHandler.validateTeacher,
	authHandler.createToken,
	authHandler.deletePrevUserTokens,
	authHandler.insertJwtToken);

router.get("/auth_admin",
	authHandler.validateAdmin,
	authHandler.createToken,
	authHandler.deletePrevUserTokens,
	authHandler.insertJwtToken);

module.exports = router;
