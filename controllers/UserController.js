import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import User from './../models/userModel.js'

import Conf from './../config.js'

var userRouter = express.Router()

import roles from './../roles.js'
import Auth from './AuthController.js'

// get all user
userRouter.get('/', async (req, res) => {
    // find all data in db

    if(Auth.allowIfLoggedin){
        const user = await User.find({})
   
        if(user){
            res.json(user)
        } else {
            res.status(404).json({
                message: "User not found"
            })
        }
    }else{
        res.status(404).json({
            message: "User not login"
        })
    }
    
})

export default userRouter