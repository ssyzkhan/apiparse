const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/signin').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/updatePassword').patch(authController.protect,authController.updatePassword);
module.exports = router;