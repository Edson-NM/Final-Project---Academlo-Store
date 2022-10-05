const express = require('express');

// Controllers
const {
	createUser,
	login,
	updateUser,
	deleteUser,
	getProductsCreatedByUser,
	getAllOrdersByUser,
	getOrderUSerById,
} = require('../controllers/users.controller');

// Middlewares
const { userExists } = require('../middlewares/users.middlewares');
const {
	createUserValidators,
} = require('../middlewares/validators.middlewares');
const {
	protectSession,
	protectUsersAccount,
} = require('../middlewares/auth.middlewares');

const usersRouter = express.Router();

usersRouter.post('/', createUserValidators, createUser);
usersRouter.post('/login', login);

// Protecting below endpoints
usersRouter.use(protectSession);

usersRouter.get('/me', getProductsCreatedByUser);
usersRouter.patch('/:id', userExists, protectUsersAccount, updateUser);
usersRouter.delete('/:id', userExists, protectUsersAccount, deleteUser);
usersRouter.get('/orders', getAllOrdersByUser);
usersRouter.get('/orders/:id', getOrderUSerById);

module.exports = { usersRouter };
