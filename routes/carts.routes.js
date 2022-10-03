const express = require('express');

// Controllers

// Middlewares

const cartsRouter = express.Router();

// Protecting below endpoints
cartsRouter.post('/add-product');
cartsRouter.patch('/update-cart');
cartsRouter.delete('/:productId');
cartsRouter.post('/purchase');

module.exports = { cartsRouter };
