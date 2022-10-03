const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

dotenv.config({ path: './config.env' });

const createUser = catchAsync(async (req, res, next) => {
	const { userName, email, password } = req.body;

	// Encrypt the password
	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = await User.create({
		userName,
		email,
		password: hashedPassword,
	});

	// Remove password from response
	newUser.password = undefined;

	// 201 -> Success and a resource has been created
	res.status(201).json({
		status: 'success',
		data: { newUser },
	});
});

const login = catchAsync(async (req, res, next) => {
	// Get email and password from req.body
	const { email, password } = req.body;

	// Validate if the user exist with given email
	const user = await User.findOne({
		where: { email, status: 'active' },
	});

	// Compare passwords (entered password vs db password)
	// If user doesn't exists or passwords doesn't match, send error
	if (!user || !(await bcrypt.compare(password, user.password))) {
		return next(new AppError('Wrong credentials', 400));
	}

	// Remove password from response
	user.password = undefined;

	// Generate JWT (payload, secretOrPrivateKey, options)
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});

	res.status(200).json({
		status: 'success',
		data: { user, token },
	});
});

const getProductsCreatedByUser = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const productsCreatedByUser = await Product.findAll({
		where: { userId: sessionUser.id },
	});

	if (!productsCreatedByUser)
		return next(
			new AppError(
				'User has not yet created any product. Please create a new one.',
				400
			)
		);

	res.status(200).json({
		status: 'success',
		data: {
			productsCreatedByUser,
		},
	});
});

const updateUser = catchAsync(async (req, res, next) => {
	const { userName, email } = req.body;
	const { user } = req;

	await user.update({ userName, email });

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

const deleteUser = catchAsync(async (req, res, next) => {
	const { user } = req;

	await user.update({ status: 'deleted' });

	res.status(204).json({ status: 'success' });
});

module.exports = {
	getProductsCreatedByUser,
	createUser,
	updateUser,
	deleteUser,
	login,
};
