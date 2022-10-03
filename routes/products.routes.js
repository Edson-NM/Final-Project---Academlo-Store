const express = require('express');

// Controllers

// Middlewares

const productsRouter = express.Router();

productsRouter.get('/');
productsRouter.get('/:id');
productsRouter.get('/categories');

// Protecting below endpoints
productsRouter.post('/');
productsRouter.patch('/:id');
productsRouter.delete('/:id');
productsRouter.post('/categories');
productsRouter.patch('/categories/:id');

module.exports = { productsRouter };
