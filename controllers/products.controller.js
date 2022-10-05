const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

dotenv.config({ path: './config.env' });

const createProduct = catchAsync(async (req, res, next) => {});

const getAllAvailableProducts = catchAsync(async (req, res, next) => {
	const activeProducts = await Product.findAll({ where: { status: 'active' } });

	res.status(200).json({
		status: 'success',
		data: {
			activeProducts,
		},
	});
});

const getProductById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const productById = await Product.findOne({ where: { id } });

	if (!productById)
		return next(
			new AppError(
				'The product you are trying to find, does not exist. Please try with another one',
				400
			)
		);

	res.status(200).json({
		status: 'success',
		data: {
			productById,
		},
	});
});

const updateProduct = catchAsync(async (req, res, next) => {
	const { title, description, price, quantity } = req.body;
	const { product } = req;

	await product.update({ title, description, price, quantity });

	res.status(201).json({
		status: 'success',
		message: 'The product has been updated successfully',
		data: {
			product,
		},
	});
});

const deleteProduct = catchAsync(async (req, res, next) => {
	const { product } = req;

	await product.update({ status: 'removed' });

	res.status(201).json({
		status: 'success',
		message: `The product ${product.title} has been deleted successfully`,
	});
});

const getAllActiveCategories = catchAsync(async (req, res, next) => {
	const activesCategories = await Category.findAll({
		where: { status: 'active' },
	});

	res.status(200).json({
		status: 'success',
		data: {
			activesCategories,
		},
	});
});

const createCategory = catchAsync(async (req, res, next) => {
	const { name } = req.body;

	const category = await Category.create({ name });

	res.status(201).json({
		status: 'success',
		message: `Category ${category} has been created successfully`,
	});
});
const updateCategory = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { name } = req.body;

	const category = await Category.findOne({ where: { id } });

	if (!category)
		return next(
			new AppError('Category you are trying to update, does not exist', 500)
		);

	await category.update({ name });

	res.status(201).json({
		status: 'success',
		message: 'Category has been updated successfully',
	});
});

module.exports = {
	getAllActiveCategories,
	createCategory,
	updateCategory,
	getAllAvailableProducts,
	getProductById,
	updateProduct,
	deleteProduct,
};
