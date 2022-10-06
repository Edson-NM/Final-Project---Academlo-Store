const express = require('express');

// Controllers
const {
	getAllAvailableProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	createProduct,
} = require('../controllers/products.controller');
const {
	getAllActiveCategories,
	updateCategory,
	createCategory,
} = require('../controllers/categories.controller');

// Middlewares
const {
	createProductValidator,
} = require('../middlewares/validators.middlewares');
const {
	protectSession,
	protectProductByUSer,
} = require('../middlewares/auth.middlewares');
const { productExist } = require('../middlewares/products.middlewares');

// Utils
const { upload } = require('../utils/multer.util');

// Create product router
const productsRouter = express.Router();

productsRouter.get('/', getAllAvailableProducts);
productsRouter.get('/:id', getProductById);
productsRouter.get('/categories', getAllActiveCategories);

// Protecting below endpoints
productsRouter.use(protectSession);

productsRouter.post(
	'/',
	createProductValidator,
	upload.array('productImg', 5),
	createProduct
);
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
