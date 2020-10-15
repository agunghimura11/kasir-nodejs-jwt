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
//validateToken(req.headers)
async function validateToken(header){
    const token = header['x-access-token']
    return await jwt.verify(token, Conf.secret)
}

import roles from './../roles.js'
// get all user
userRouter.get('/', async (req, res) => {
    // find all data in db
    const validToken = await validateToken(req.headers);
    if (!validToken) throw(validToken)
    
    const permission = roles.can(req.body.role).readAny('video');
    if(permission.granted){
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
            message: "Access denied"
        })
    }
    
})

export default userRouter