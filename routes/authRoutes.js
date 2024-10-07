const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes
router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/signup', authController.getSignup);
router.get('/login', authController.getLogin);
router.get('/home', authController.getHome);
router.get('/about', authController.getAbout);
router.get('/contact', authController.getContact);
router.get('/cart/view', authController.getCart);
router.get('/products', authController.getProduct);
router.get('/logout', authController.logout);

router.post('/signup', authController.postSignup);
router.post('/login', authController.postLogin);
router.post('/contact', authController.postContact);
router.post('/cart/add', authController.postAddToCart);
router.post('/cart/remove', authController.postRemoveFromCart);
router.post('/products/add', authController.postAddProduct);
router.post('/products/update', authController.postUpdateProduct);
router.post('/products/delete', authController.postDeleteProduct);

module.exports = router;
