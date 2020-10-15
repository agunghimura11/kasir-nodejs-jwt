import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import dotenv from 'dotenv'

import userRouter from './controllers/UserController.js'

dotenv.config()

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology:true,
}, (err) => {
    if(err) {
        throw err
    }else{
        console.log('Database connection established')
    }
})

const app = express()

//Middleware
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req,res) => {
    res.json({
        message: 'success',
    })
})

app.use('/api/user', userRouter) //call router for user auth

app.listen(process.env.PORT, () => {
    console.log(`App listen to port ${process.env.PORT}`)
})