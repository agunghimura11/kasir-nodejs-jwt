import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import dotenv from 'dotenv'


import User from './models/userModel.js'

import jwt from 'jsonwebtoken'

import userRouter from './controllers/UserController.js'
import authRouter from './controllers/AuthController.js'

import Conf from './config.js'

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

app.use('/api', authRouter) //call router for user auth

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
   const accessToken = req.headers["x-access-token"];
   const { userId, exp } = await jwt.verify(accessToken, Conf.secret);
   // Check if token has expired
   if (exp < Date.now().valueOf() / 1000) {
    return res.status(401).json({
     error: "JWT token has expired, please login to obtain a new one"
    });
   }
   res.locals.loggedInUser = await User.findById(userId);
   next();
  } else {
   next();
  }
});

app.use('/api/user', userRouter) //call router for user auth

app.listen(process.env.PORT, () => {
    console.log(`App listen to port ${process.env.PORT}`)
})