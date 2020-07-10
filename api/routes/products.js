const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        // to store file
        cb(null, true)
    }else{
        // to reject file
        cb(null,false)
    }    
}

const upload = multer({
    storage,
    limits:{
        fileSize: 1024 * 1024 *5
    },
    fileFilter: fileFilter
})


router.get('/',async (req,res,next) => {
    try {
        const allProducts = await Product.find().select('name price _id productImage')
        let response = {
            count:allProducts.length,
            allProducts: allProducts.map(product => {
                return {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    productImage: product.productImage,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/products/" + product._id
                    }
                }
            })
        }
        if(allProducts.length>0){
            res.status(200).json(
                response
            )
        }else{
            res.status(404).json({
                "errorMessage": "There are no products."
            })
        }
    } catch (error) {
        res.status(500).json({
            "errorMessage": "No any products",
            error
        })
    }
})

router.post('/', upload.single('productImage') ,async (req,res,next) => {
    try {
        const createdProduct = await new Product({
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
        })
        
        await createdProduct.save()
    
        res.status(200).json({
            createdProduct
        })
    } catch (error) {
        res.status(404).json({
            "errorMessage": "Cant create new product.",
            error
        })
    }
})

router.get('/:productId',async (req,res,next) => {
    try {
        const id = req.params.productId
        const singleProduct = await Product.findById(id).select('price name productImage _id')
        if(singleProduct){
            res.status(200).json({
                singleProduct
            })
        }else{
            res.status(404).json({
                "errorMessage": "Cant find product with ID."
            })
        }
    } catch (error) {
        res.status(500).json({
            "errorMessage": "Not valid ID of product.",
            error
        })
    }
})

router.put('/:productId',async (req,res,next) => {
    try {
        const id = req.params.productId
        const updatedPost = await Product.findById(id)
        updatedPost.name = req.body.name
        updatedPost.price = req.body.price
        await updatedPost.save()
        res.status(200).json({
            updatedPost
        })
    } catch (error) {
        res.status(500).json({
            "errorMessage": "Can't change product.",
            error
        })
    }
})

router.delete('/:productId',async (req,res,next) => {
    try {
        const id = req.params.productId
        const deletedProduct = await Product.findByIdAndRemove(id)
        res.status(200).json({
            message: "Product deleted successfully.",
            deletedProduct
        })
    } catch (error) {
        res.status(500).json({
            message: "Can't delete product."
        })
    }
})

module.exports = router