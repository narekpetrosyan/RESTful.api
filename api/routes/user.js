const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


router.post('/signup',(req,res,next) => {
    User.find({email: req.body.email})
        .then(user => {
            if(user.length >= 1){
                return res.status(409).json({
                    message: "Mail exists"
                }); 
            }else{
                bcrypt.hash(req.body.password,10,(err,hash) => {
                    if(err){
                        return res.status(500).json({
                            errorMessage: err
                        })
                    }else{
                        const newUser = new User({
                            email: req.body.email,
                            password: hash
                        })
                        newUser.save()
                        res.status(201).json({
                            message: 'User created.'
                        })
                        console.log(newUser)
                    }
                }) 
            }
        })
        .catch(err => {
            console.log(err)
        })
})


router.post('/login',(req,res,next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1){
                return res.status(401).json({
                    message: "Auth failed."
                })
            }
            bcrypt.compare(req.body.password,user[0].password,(err,result) => {
                if(err){
                    return res.status(401).json({
                        message: "Auth failed."
                    })
                }
                if(result){
                    const token = jwt.sign({
                        email:user[0].email,
                        userId: user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    })
                    return res.status(200).json({
                        message: "Auth successfull.",
                        token
                    })
                }
                res.status(401).json({
                    message: "Auth failed."
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                err
            })
        })
})



router.delete('/:userId',async (req,res,next) => {
    try {
        const deletedUser = await User.findByIdAndRemove(req.params.userId)
        res.status(200).json({
            message: "User deleted successfully.",
            deletedUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Can't delete user.",
            error
        })
    }
})


module.exports = router