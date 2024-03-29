import * as db from '../db/db.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import bcrypt from 'bcrypt';

export const authenticate = function (req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) {
		return res.status(401).send('Token not provided');
	}
	jwt.verify(token, config.secret, function (error) {
		if (error) {
			return res.status(401).send('Login Unsuccessful');
		} else {
			next();
		}
	});
};

export const login = async function (req, res) {
	const { email, password } = req.body;
	const dbRes = await db.query('SELECT * from users where email = $1', [email]);
	if (dbRes.rowCount < 1) {
		return res.status(401).send('Invalid Email or password');
	}

	const hash = dbRes.rows[0].password;
	bcrypt.compare(password, hash, async function (err, result) {
		if (err || !result) {
			res.status(401).send('Invalid Password');
		} else {
			jwt.sign({ email }, config.secret, function (err, token) {
				res.json({
					token,
					email: dbRes.rows[0].email,
					firstName: dbRes.rows[0].firstname,
					lastName: dbRes.rows[0].lastname,
					roleId: dbRes.rows[0].roleid
				});
			});
		}
	});
};
