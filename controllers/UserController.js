import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'


var router = express.Router()
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

import User from './../models/userModel.js'

import Conf from './../config.js'

var userRouter = express.Router()

// register new user
userRouter.post('/register', function (req, res) {
    try {
        var hashedPassword = bcrypt.hashSync(req.body.password, 8)

        User.create({
            username: req.body.username,
            lastname: req.body.lastname,
            password: hashedPassword,
            role : req.body.role,
        },
        function (err, user) {
            if(err) return res.status(500).send("There was a problem registering the user.")

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

userRouter.post('/login', async function (req, res, next) {
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

export default userRouter