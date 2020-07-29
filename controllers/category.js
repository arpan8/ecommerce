const Category = require('../models/category');
const Product = require('../models/product');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const category = new Category(req.body);
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({ data });
    });
};

exports.categoryById = (req, res, next, id)=>{
    Category.findById(id).exec((err, category)=>{
        if(err || !category){
            return res.status(400).json({
                error: 'Category does not exist'
            });
        }
        req.category = category;
        next();
    });
};

exports.read = (req, res)=>{
    return res.json(req.category)
};

exports.update = (req, res)=>{
    const category = req.category;
    category.name = req.body.name;
    category.save((err, data)=>{
        if(err || !data){
            return res.status(400).json({
                error: 'Category Updataion failed'
            });
        }
        res.json(data);
    });
};
exports.remove = (req, res)=>{
    const category = req.category;
    Product.find(category).exec((err, data)=>{
        if(data.length > 0){
            return res.status(400).json({
                message: `Sorry, you can not delete ${category.name}. It has ${data.length} products` 
            }); 
        }else{
            category.remove((err, data)=>{
                if(err || !data){
                    return res.status(400).json({
                        error: 'Category deletion failed'
                    });
                } 
                res.json({
                    message: 'Category deleted'
                });
            });
        }
    });
};

exports.list = (req, res)=>{
    Category.find().exec((err, data)=>{
        if(err || !data){
            return res.status(400).json({
                error: 'Could not find any list'
            });
        }
        res.json(data);
    })
}