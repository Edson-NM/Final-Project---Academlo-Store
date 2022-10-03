const express = require('express');

// Controllers
const {
	updateUser,
	deleteUser,
	getProductsCreatedByUser,
} = require('../controllers/users.controller');

// Middlewares
const { userExists } = require('../middlewares/users.middlewares');
const {
	protectSession,
	protectUsersAccount,
} = require('../middlewares/auth.middlewares');

const usersRouter = express.Router();

usersRouter.post('/');
usersRouter.post('/login');

// Protecting below endpoints
usersRouter.use(protectSession);

usersRouter.get('/me');
usersRouter.patch('/:id', userExists, protectUsersAccount, updateUser);
usersRouter.delete('/:id', userExists, protectUsersAccount, deleteUser);
usersRouter.get('/orders');
usersRouter.get('/orders/:id');

module.exports = { usersRouter };
