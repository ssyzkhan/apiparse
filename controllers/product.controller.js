const Product = require('../models/product.model.js');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const customError = require('../Utils/customError.js');
const ApiFeatures = require('../Utils/ApiFeatures.js');

const getProducts = asyncErrorHandler(async (req, res, next) => {
    
    const features = new ApiFeatures(Product.find(),req.query).filter().sort().limitFields().paginate();
    let products = await features.query;
    //const products = await Product.find({});
    // find({name:'John',age:{$gte:18}})

    if(!products){
        const err = new customError('product is not found!',404);
        return next(err);
    }
    res.status(200).json(products);
});
const getProduct = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if(!product){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json(product);
});
const createProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.create(req.body);
    if(!product){
        const err=new customError('product created fail!',401);
        return next(err);
    }
    res.status(200).json(product);
});
// update a product
const updateProduct = asyncErrorHandler(async (req, res, next) => {

    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body)
    if(!product){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    const updateProduct = await Product.findById(id);
    res.status(200).json(updateProduct);

});
// delete a product
const deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if(!product){
        const err=new customError('product with that ID is not found!',404);
        return next(err);
    }
    res.status(200).json({ message: "Product deleted successfully" });
});

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}
