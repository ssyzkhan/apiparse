const Task = require('../models/task.model.js');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const customError = require('../Utils/customError.js');
const ApiFeatures = require('../Utils/ApiFeatures.js');

const getTasks = asyncErrorHandler(async (req, res, next) => {
    
    const features = new ApiFeatures(Task.find(),req.query).filter().sort().limitFields().paginate();
    let tasks = await features.query;
    //const products = await Product.find({});
    // find({name:'John',age:{$gte:18}})

    if(!tasks){
        const err = new customError('product is not found!',404);
        return next(err);
    }
    res.status(200).json(tasks);
});
const getTask = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if(!task){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json(task);
});
const createTask = asyncErrorHandler(async (req, res, next) => {
    const task = await Task.create(req.body);
    if(!task){
        const err=new customError('task created fail!',401);
        return next(err);
    }
    res.status(200).json(task);
});
// update a product
const updateTask = asyncErrorHandler(async (req, res, next) => {

    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body)
    if(!task){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    const updateTask = await Task.findById(id);
    res.status(200).json(updateTask);

});
// delete a product
const deleteTask = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if(!task){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json({ message: "Product deleted successfully" });
});

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
}
