const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const ResponseWrapper = (status, result, message) => {
	return {'status': status, 'result': result, 'message': message};
}


const validateTeacher = (req, res, next) => {

	if (!req.headers.authorization) {
		res.json(ResponseWrapper("ERROR", null, "Token not specified!"));
		return;
	}

	const token = req.headers.authorization.split(" ")[1];

	try {
		const payload = jwt.verify(token, secret);

		if (req.params.teacherID == payload.userID && payload.type == "teacher") {
			next();
		} else {
			res.json(ResponseWrapper("ERROR", null, payload));
		}

	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

const validateStudent = (req, res, next) => {

	if (!req.headers.authorization) {
		res.json(ResponseWrapper("ERROR", null, "Token not specified!"));
		return;
	}

	const token = req.headers.authorization.split(" ")[1];

	let payload;

	try {

		payload = jwt.verify(token, secret);

		if (req.params.studentID == payload.userID && payload.type == "student") {
			next();
		} else {
			res.json(ResponseWrapper("ERROR", null, payload));
		}

	} catch (err) {

		res.json(ResponseWrapper("ERROR", null, err.message));

	}
}

const validateAdmin = (req, res, next) => {

    if (!req.headers.authorization) {
        res.json(ResponseWrapper("ERROR", null, "Token not specified!"));
        return;
    }

    const token = req.headers.authorization.split(" ")[1];

    let payload;

    try {

        payload = jwt.verify(token, secret);

        if (req.params.adminID == payload.userID && payload.type == "admin") {
            next();
        } else {
            res.json(ResponseWrapper("ERROR", null, payload));
        }

    } catch (err) {

        res.json(ResponseWrapper("ERROR", null, err.message));

    }
}

module.exports = {
	'ResponseWrapper': ResponseWrapper,
	'validateTeacher': validateTeacher,
	'validateStudent': validateStudent,
	'validateAdmin': validateAdmin
};
