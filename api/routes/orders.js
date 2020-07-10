const express = require('express')
const router = express.Router()
const Order = require('../models/Order')


router.get('/',async (req,res,next) => {
    try {
        const allOrders = await Order.find().select('product quantity _id').populate('product','name')
        const response = {
            count: allOrders.length,
            allOrders: allOrders.map(order => {
                return {
                    id: order._id,
                    quantity: order.quantity,
                    product:order.product,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/orders/" + order._id
                    }
                }
            })
            
        }
        res.status(200).json(
            response
        )
    } catch (error) {
        res.status(500).json({
            error
        })
    }
})

router.post('/',async (req,res,next) => {
    try {
        const newOrder = await new Order({
            quantity: req.body.quantity,
            product: req.body.productId
        })
        await newOrder.save()
        res.status(201).json({
            newOrder
        })
    } catch (error) {
        res.status(500).json({
            "errorMessage": "There are no products.",
            error
        })
    }
})

router.get('/:orderId',async (req,res,next) => {
    const id = req.params.orderId
    const singleOrder = await Order.findById(id).populate('product','name')
    if(singleOrder){
        res.status(200).json({
            singleOrder
        })
    }else{
        res.status(404).json({
            "errorMessage": "Cant find order with ID."
        })
    }
})


router.delete('/:orderId',async (req,res,next) => {
    try {
        const id = req.params.orderId
        const deletedOrder = await Order.findByIdAndRemove(id)
        res.status(200).json({
            message: "Order deleted successfully.",
            deletedOrder
        })
    } catch (error) {
        res.status(500).json({
            message: "Can't delete order."
        })
    }
})

module.exports = router