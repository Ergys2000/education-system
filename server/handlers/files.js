const {ResponseWrapper} = require("../routes/utils");

const public_dir = `${process.env['HOME']}/Public`;

const multer = require("multer");
const fs = require("fs");


exports.fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		// first get the parameters that determine where the file will be
		// stored
		const classInstanceID = req.classInstanceID;
		const { studentID, courseInstanceID } = req.params;

		// determine the destination
		let dest = ``;
		if (!studentID) {
			dest = `${public_dir}/${classInstanceID}/${courseInstanceID}/shared`;
		} else {
			dest = `${public_dir}/${classInstanceID}/${courseInstanceID}/${studentID}`;
		}

		// wrap the createDir operation in a try catch to prevent server
		// failure
		try {
			if (!fs.existsSync(dest)) {
				fs.mkdirSync(dest, {recursive: true});
			}
		} catch (err) {
			console.log(err.message);
		}
		cb(null, dest);
	},
	filename: function (req, file, cb) {
		const filename = file.originalname;
		const fileSuffix = "-" + Date.now() + "." + filename.split(".")[1];
		file.storedName = filename.split(".")[0] + fileSuffix;
		cb(null, file.storedName);
	}
});

exports.profilePictureStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dest = `${public_dir}/profile-pics`;
		// wrap the createDir operation in a try catch to prevent server
		// failure
		try {
			if (!fs.existsSync(dest)) {
				fs.mkdirSync(dest, {recursive: true});
			}
		} catch (err) {
			console.log(err.message);
		}
		cb(null, dest);
	},
	filename: (req, file, cb) => {
		const { id, type } = req.user;
		const mimeType = file.originalname.split(".")[1];
		const filename = `${id}-${type}.${mimeType}`;
		cb(null, filename);
	}
});
