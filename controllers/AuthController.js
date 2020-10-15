import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import User from './../models/userModel.js'

import Conf from './../config.js'

var authRouter = express.Router()

// register new user
authRouter.post('/register', function (req, res) {
    try {
        var hashedPassword = bcrypt.hashSync(req.body.password, 8)
        console.log(req.body)
        User.create({
            username: req.body.username,
            lastname: req.body.lastname,
            password: hashedPassword,
            role : req.body.role,
        },
        function (err, user) {
            if(err) throw(err)

            var accessToken = jwt.sign({ id: user._id }, Conf.secret, {
                // 1 menit -> 60 second, 20 menit -> 1200 second
                expiresIn : 1200 
            })
    
            User.accessToken = accessToken
  
            res.status(200).send({
                data: User,
                accessToken
            })
        })
    } catch (error) {
       throw (error)
    }
})

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

authRouter.post('/login', async function (req, res, next) {
    try {
     const { 
         username, password 
     } = req.body

     const user = await User.findOne({ username });
     
     if (!user) 
        return next(new Error('Email does not exist'));
     
     const validPassword = await validatePassword(password, user.password);
     
     if (!validPassword) return next(new Error('Password is not correct'))
     
     var accessToken = jwt.sign({ id: user._id }, Conf.secret, {
        // 1 menit -> 60 second, 20 menit -> 1200 second
        expiresIn : 1200 
     })

     await User.findByIdAndUpdate(user._id, { accessToken })

     res.status(200).json({
      data: { username: user.username, role: user.role },
      accessToken
     })
    } catch (error) {
        throw(error)
    }
})

authRouter.grantAccess = function(action, resource) {
return async (req, res, next) => {
    try {
    const permission = roles.can(req.user.role)[action](resource);
    if (!permission.granted) {
    return res.status(401).json({
    error: "You don't have enough permission to perform this action"
    });
    }
    next()
    } catch (error) {
    next(error)
    }
}
}

authRouter.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
        return res.status(401).json({
        error: "You need to be logged in to access this route"
        });
        req.user = user;
        next();
        } catch (error) {
        next(error);
        }
}

export default authRouter