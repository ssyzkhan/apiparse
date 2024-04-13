const express = require('express');
const {getTasks,getTask,createTask,updateTask,deleteTask} = require('../controllers/task.controller.js');
const router = express.Router();
const {authCourse} = require('../middlewares.js');
const authController = require('../controllers/auth.controller.js');

router.get('/',getTasks);
router.get('/:id',getTask);
router.post('/',createTask);
router.put('/:id',updateTask);
router.delete('/:id',deleteTask);
module.exports = router;
