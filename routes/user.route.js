const express = require('express');
const {getUsers,getUser,createUser,updateUser,deleteUser,updatePassword,updateMe,deleteMe} = require('../controllers/user.controller.js');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const {authCourse} = require('../middlewares.js');

router.get('/',authController.protect,getUsers);
router.get('/:id',getUser);
router.post('/',createUser);
router.put('/:id',updateUser);
//router.delete('/:id',deleteUser);
//router.route('/updatePassword').patch(authController.protect,updatePassword);
router.patch('/updatePassword',authController.protect,updatePassword);
router.route('/updateMe').patch(authController.protect,updateMe);
router.route('/deleteMe').delete(authController.protect,deleteMe);
module.exports = router;
