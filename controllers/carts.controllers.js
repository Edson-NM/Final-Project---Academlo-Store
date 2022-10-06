// Model
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');

// Util
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const createCart = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;
	const { productId, quantity } = req.body;

	// Validate quantity don´t exceed stock product
	const productStock = await Product.findOne({ where: { id: productId } });

	if (!productStock)
		return next(
			new AppError(
				'Product your trying to add, does not exist. Please add an existing one',
				400
			)
		);

	if (productStock.quantity < quantity)
		return next(
			new AppError(
				`This product only has ${productStock.quantity} items in stock, please select a smaller quantity to add`,
				400
			)
		);

	// Find cart by user in session
	const cart = await Cart.findOne({
		where: { userId: sessionUser.id, status: 'active' },
	});

	// Validate if user have an active cart, id don´t create a new one
	if (!cart) {
		const newCart = await Cart.create({ userId: sessionUser.id }); //Creating cart

		await ProductInCart.create({ productId, quantity, cartId: newCart.id });
	} else {
		const cart = await Cart.findOne({ where: { status: 'active' } });

		const product = await ProductInCart.findOne({
			where: { cartId: cart.id, productId },
		});

		if (!product) {
			ProductInCart.create({ productId, quantity, cartId: cart.id });
		} else if (product.status === 'active') {
			return next(
				new AppError('This product has been already added to Cart', 400)
			);
		} else if (product && product.status === 'removed') {
			await product.update({ status: 'active', quantity });
		}
	}

	res.status(201).json({
		status: 'success',
		message: 'Product has been successfully added to cart',
	});
});

const updateCart = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;
	const { productId, newQty } = req.body;

	const cart = await Cart.findOne({
		where: { userId: sessionUser.id, status: 'active' },
	});

	if (!cart)
		return next(
			new AppError(
				'You do not have active carts. Please add a product to create a new one',
				400
			)
		);

	const productStock = await Product.findOne({ where: { id: productId } });

	if (!productStock) {
		return next(
			new AppError(
				'The product your are trying to update, does not exist. Please select an available one',
				400
			)
		);
	}

	if (productStock.quantity < newQty) {
		return next(
			new AppError(
				`This product only has ${productStock.quantity} items in stock, please select a smaller quantity to add`,
				400
			)
		);
	}

	const productInCart = await ProductInCart.findOne({ where: { productId } });

	if (newQty === 0) {
		await productInCart.update({ status: 'removed' });
	} else if (newQty > 0 || productInCart.status === 'removed') {
		await productInCart.update({ status: 'active', quantity: newQty });
	} else {
		await productInCart.update({ quantity: newQty });
	}

	res.status(201).json({
		status: 'success',
		message: 'Product successfully updated',
	});
});

const deleteProductInCart = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;
	const { productId } = req.params;

	cart = await Cart.findOne({
		where: { userId: sessionUser.id, status: 'active' },
	});

	if (!cart) {
		return next(new AppError('You do not have an active cart', 400));
	} else {
		const productInCart = await ProductInCart.findOne({
			where: { productId },
		});

		if (!productInCart) {
			return next(
				new AppError(
					'The product you are trying to removed does not exist in your cart',
					400
				)
			);
		} else if (productInCart.status === 'removed') {
			return next(new AppError('This product have been already removed', 400));
		} else {
			await productInCart.update({ status: 'removed', quantity: 0 });
		}

		res.status(201).json({
			status: 'success',
		});
	}
});

const purchasedCart = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const cart = await Cart.findOne({
		where: { userId: sessionUser.id, status: 'active' },
		attributes: ['id', 'userId', 'status'],
		include: {
			model: ProductInCart,
			where: { status: 'active' },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
			include: {
				model: Product,
				attributes: { exclude: ['createdAt', 'updatedAt'] },
			},
		},
	});

	let total = 0;
	const productInCartPromises = cart.productInCarts.map(async productInCart => {
		newQuantity = productInCart.product.quantity - productInCart.quantity;

		const product = await Product.findOne({
			where: { id: productInCart.product.id },
		});

		await product.update({ quantity: newQuantity });

		price = productInCart.quantity * productInCart.product.price;

		total += price;

		productInCart.update({ status: 'purchased' });
	});

	await Promise.all(productInCartPromises);

	await cart.update({ status: 'purchased' });

	const order = Order.create({
		userId: sessionUser.id,
		cartId: cart.id,
		totalPrice: total,
	});

	res.status(201).json({
		status: 'success',
		data: { order },
	});
});

module.exports = { createCart, updateCart, deleteProductInCart, purchasedCart };
