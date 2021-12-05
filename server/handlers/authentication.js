const conn = require("../mysqlConnection");
const { ResponseWrapper } = require("../routes/utils");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

exports.validateStudent = (req, res, next) => {
	const email = req.query.email;
	const password = req.query.password;

	if (!email || !password) {
		res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, "An error occured!"));
		return;
	}
	const sql = `SELECT * FROM student WHERE email=? and password=?`;
	conn.query(sql, [email, password], (err, result, _fields) => {
		try {
			if (err)
				throw err;
			if (result.length == 0) {
				res.json(ResponseWrapper("OK", { token: null, authenticated: false }, "Does not exist!"));
			}
			else {
				req.payload = { userID: result[0].id, type: "student" };
				next();
			}
		} catch (error) {
			res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, err.message));
		}
	});
}

exports.validateTeacher = (req, res, next) => {
	const email = req.query.email;
	const password = req.query.password;

	if (!email || !password) {
		res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, "An error occured!"));
		return;
	}
	const sql = `SELECT * FROM teacher WHERE email=? and password=?`;
	conn.query(sql, [email, password], (err, result, _fields) => {
		try {
			if (err)
				throw err;
			if (result.length === 0) {
				res.json(ResponseWrapper("OK", { token: null, authenticated: false }, "Does not exist!"));
			}
			else {
				req.payload = { userID: result[0].id, type: "teacher" };
				next();
			}
		} catch (error) {
			res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, err.message));
		}
	});
}

exports.validateAdmin = (req, res, next) => {
	const email = req.query.email;
	const password = req.query.password;

	if (!email || !password) {
		res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, "An error occured!"));
		return;
	}
	const sql = `SELECT * FROM admin WHERE email=? and password=?`;
	conn.query(sql, [email, password], (err, result, _fields) => {
		try {
			if (err)
				throw err;
			if (result.length === 0) {
				res.json(ResponseWrapper("OK", { token: null, authenticated: false }, "Does not exist!"));
			}
			else {
				req.payload = { userID: result[0].id, type: "admin" };
				next();
			}
		} catch (error) {
			res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, err.message));
		}
	});
}

exports.createToken = (req, _res, next) => {
	req.token = jwt.sign(req.payload, secret, { expiresIn: "1800s" });
	next();
}

exports.deletePrevUserTokens = (req, res, next) => {
	const { userID, type } = req.payload;
	const sql = `DELETE FROM jwt_token WHERE userID=? and type=?`;
	conn.query(sql, [userID, type], (err, result, _fields) => {
		try {
			if (err) throw err;
			next();
		} catch (error) {
			res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, "An error occured!"));
		}
	});
}

exports.insertJwtToken = (req, res) => {
	const { userID, type } = req.payload;
	sql = `INSERT INTO jwt_token(userID, type) VALUE(?, ?)`;
	conn.query(sql, [userID, type], (err, result, _fields) => {
		try {
			if (err) throw err;

			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", { token: req.token, authenticated: true, id: userID }, "Token registered successfully!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", { token: null, authenticated: false }, "Token was not registered"));
		}
	});
}
