const express = require('express')
const app = express()
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoBD = require('./config/db')

//Load config
dotenv.config({path: './config/.env'})


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))
app.use('/uploads',express.static('uploads'))


//Mongoose
mongoBD()


app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,PATCH,DELETE,POST,GET')
        return res.status(200).json({})
    }
    next()
})


// Routes
app.use('/products', require('./api/routes/products'))
app.use('/orders', require('./api/routes/orders'))
app.use('/user', require('./api/routes/user'))


app.use((req,res,next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error,req,res,next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})


app.listen(process.env.PORT,()=>{
    console.log('Server is running.')
})