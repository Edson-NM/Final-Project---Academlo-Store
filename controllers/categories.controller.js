// Model
const { Category } = require('../models/category.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const getAllActiveCategories = catchAsync(async (req, res, next) => {
	// const { id } = req.params;
	const categories = await Category.findAll({ where: { status: 'active' } });

	res.status(200).json({
		status: 'success',
		data: {
			categories,
		},
	});
});

const createCategory = catchAsync(async (req, res, next) => {
	const { name } = req.body;

	const category = await Category.create({ name });

	res.status(201).json({
		status: 'success',
		message: `Category ${category.name} has been created successfully`,
	});
});

const updateCategory = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { name } = req.body;

	const category = await Category.findOne({ where: { id } });

	if (!category)
		return next(
			new AppError(
				'Category you are trying to update, does not exist. Please select an existing one',
				400
			)
		);

	const oldCategory = category.name;
	await category.update({ name });

	res.status(201).json({
		status: 'success',
		message: `The ${oldCategory} category has successfully updated to ${category.name}`,
	});
});

module.exports = { getAllActiveCategories, createCategory, updateCategory };
