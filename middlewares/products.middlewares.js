// Model
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { Category } = require('../models/category.model');

const productExist = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const product = await Product.findOne({ where: { id } });

	if (!product)
		return next(
			new AppError(
				'The product you are trying to update does not exist. Please select an existing one.',
				400
			)
		);

	req.product = product;
	next();
});

module.exports = { productExist };
