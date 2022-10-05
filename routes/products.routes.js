const express = require('express');

// Controllers
const {
	getAllActiveCategories,
	createCategory,
	updateCategory,
	getAllAvailableProducts,
	getProductById,
	updateProduct,
	deleteProduct,
} = require('../controllers/products.controller');

// Middlewares
const {
	createProductValidator,
} = require('../middlewares/validators.middlewares');
const {
	protectSession,
	protectProductByUSer,
} = require('../middlewares/auth.middlewares');
const { productExist } = require('../middlewares/products.middlewares');

const productsRouter = express.Router();

productsRouter.get('/', getAllAvailableProducts);
productsRouter.get('/:id', getProductById);
productsRouter.get('/categories', getAllActiveCategories);

// Protecting below endpoints
productsRouter.use(protectSession);

productsRouter.post('/', createProductValidator);
productsRouter.patch('/:id', productExist, protectProductByUSer, updateProduct);
productsRouter.delete(
	'/:id',
	productExist,
	protectProductByUSer,
	deleteProduct
);
productsRouter.post('/categories', createCategory);
productsRouter.patch('/categories/:id', updateCategory);

module.exports = { productsRouter };
