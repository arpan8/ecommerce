const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');
const path = require('path');

exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.productById = (req, res, next, id) => {
    Product.findById(id)
        .populate('category')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: 'Product not found'
                });
            }
            req.product = product;
            next();
        });
};

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        // check for all fields
        const { name, description, price, category, quantity, shipping } = fields;

        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let product = new Product(fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }else if (files.photo.size === 0) {
                return res.status(400).json({
                    error: "Please upload a image",
                  });
            }
            var oldPath = files.photo.path; 
            // var newPath = path.join(__dirname, 'uploads') 
            //     + '/' + files.photo.name
            // var rawData = fs.readFileSync(oldPath) ;
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
            //console.log('67',oldPath);
            //console.log('68',newPath);
            // fs.writeFile(newPath, rawData, function(err){ 
            //     if(err) {
            //         return res.status(400).json({
            //             error: "Please upload a valid image",
            //         });
            //     }
                // return res.send("Successfully uploaded") 
            //}) 
        }

        product.save((err, result) => {
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Product deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        // check for all fields
        const { name, description, price, category, quantity, shipping } = fields;

        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let product = req.product;
        //console.log(req.product);
        product = _.extend(product, fields);
        //console.log('111',req.product);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }else if (files.photo.size === 0) {
                return res.status(400).json({
                    error: "Please upload a image",
                  });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};
exports.list = (req, res)=>{
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    // console.log('161',order);
    // console.log('162',sortBy);
    // console.log('163',limit);
    Product.find().select("-photo").populate('category').sort([[sortBy, order]]).limit(limit)
    .exec((err, products)=> {
        if(err || !products){
            return res.status(400).json({
                error: 'Products not found'
            });
        }
        res.json(products);
    })
};
exports.listRelated = (req, res)=>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({_id: {$ne: req.product}, category: req.product.category}).limit(limit)
    .populate('category', '_id name')
    .exec((err, products)=> {
        if(err || !products){
            return res.status(400).json({
                error: 'Products not found'
            });
        }
        res.json(products);
    })

};
exports.listCategories = (req, res)=>{
    Product.distinct('category',{}, (err, categories)=>{
        if(err || !categories){
            return res.status(400).json({
                error: 'Categories not found'
            });
        }
        res.json(categories);
    });
    // Product.distinct('category',{}).populate('category', 'name')
    // .exec((err, categories)=> {
    //     if(err || !categories){
    //         return res.status(400).json({
    //             error: 'categories not found'
    //         });
    //     }
    //     res.json(categories);
    // })
};

exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};