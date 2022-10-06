const express = require('express');

// Controllers
const {
	createCart,
	updateCart,
	deleteProductInCart,
	purchasedCart,
} = require('../controllers/carts.controllers');

// Middlewares
const { protectSession } = require('../middlewares/auth.middlewares');

const cartsRouter = express.Router();

// Protecting below endpoints
cartsRouter.use(protectSession);

cartsRouter.post('/add-product', createCart);
cartsRouter.patch('/update-cart', updateCart);
cartsRouter.delete('/:productId', deleteProductInCart);
cartsRouter.post('/purchase', purchasedCart);

module.exports = { cartsRouter };
