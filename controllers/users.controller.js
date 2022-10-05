const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');

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
				'You have not created any product yet. Please create a new one.',
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

	res.status(204).json({
		status: 'success',
		message: `The user ${user.userName} has been deleted successfully`,
	});
});

const getAllOrdersByUser = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const allOrdersByUser = await Order.findAll({
		where: { userId: sessionUser.id },
		include: {
			model: Cart,
			include: {
				model: ProductInCart,
				where: { status: 'purchased' },
			},
		},
	});

	res.status(200).json({
		status: 'success',
		data: {
			allOrdersByUser,
		},
	});
});

const getOrderUSerById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const orderUSerById = await Order.findOne({
		where: { id },
		include: {
			model: Cart,
			include: {
				model: ProductInCart,
				where: { status: 'purchased' },
			},
		},
	});

	res.status(200).json({
		status: 'success',
		data: {
			orderUSerById,
		},
	});
});

module.exports = {
	getProductsCreatedByUser,
	createUser,
	updateUser,
	deleteUser,
	login,
	getAllOrdersByUser,
	getOrderUSerById,
};
