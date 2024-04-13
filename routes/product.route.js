const express = require('express');
const {getProducts,getProduct,createProduct,updateProduct,deleteProduct} = require('../controllers/product.controller.js');
const router = express.Router();
const {authCourse} = require('../middlewares.js');
const authController = require('../controllers/auth.controller.js');

router.get('/',authController.protect,getProducts);
router.get('/:id',authCourse,getProduct);
router.post('/',createProduct);
router.put('/:id',updateProduct);
router.delete('/:id',authController.protect,authController.restrict('admin','test1'),deleteProduct);
module.exports = router;
