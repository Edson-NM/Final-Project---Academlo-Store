const { ref, uploadBytes } = require('firebase/storage');
const dotenv = require('dotenv');

// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/productImg.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const {
	storage,
	getProductImgs,
	getProductImgsById,
} = require('../utils/firebase.util');

dotenv.config({ path: './config.env' });

const createProduct = catchAsync(async (req, res, next) => {
	const { title, description, price, categoryId, quantity } = req.body;
	const { sessionUser } = req;

	const newProduct = await Product.create({
		title,
		description,
		price,
		categoryId,
		quantity,
		userId: sessionUser.id,
	});

	// Create firebase reference
	const productImgsPromises = req.files.map(async file => {
		const [originalName, ext] = file.originalname.split('.');

		const fileName = `products/${
			newProduct.id
		}/${originalName}-${Date.now()}.${ext}`;

		const imgRef = ref(storage, fileName);

		// Upload image to Firebase
		const result = await uploadBytes(imgRef, file.buffer);

		await ProductImg.create({
			productId: newProduct.id,
			imgUrl: result.metadata.fullPath,
		});
	});

	await Promise.all(productImgsPromises);

	res.status(201).json({
		status: 'success',
		data: {
			newProduct,
		},
	});
});

const getAllAvailableProducts = catchAsync(async (req, res, next) => {
	const products = await Product.findAll({
		where: { status: 'active' },
		attributes: { exclude: ['createdAt', 'updatedAt'] },
		include: [
			{ model: Category, attributes: ['id', 'name', 'status'] },
			{ model: ProductImg, attributes: ['id', 'imgUrl'] },
		],
	});

	const productsImgs = await getProductImgs(products);

	res.status(200).json({
		status: 'success',
		data: {
			products: productsImgs,
		},
	});
});

const getProductById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const productById = await Product.findOne({
		where: { id },
		attributes: { exclude: ['createdAt', 'updatedAt'] },
		include: [
			{ model: Category, required: false },
			{ model: ProductImg, attributes: ['id', 'imgUrl'], required: false },
		],
	});

	if (!productById)
		return next(
			new AppError(
				'The product you are trying to find, does not exist. Please try with another one',
				400
			)
		);

	await getProductImgsById(productById.productImgs);

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

module.exports = {
	getAllAvailableProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	createProduct,
};
