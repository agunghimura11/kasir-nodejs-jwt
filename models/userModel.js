import mongoose from 'mongoose'

const userSchema = mongoose.Schema (
    {
        username : {
            type: String,
            required: true,
        },
        password : {
            type : String,
            required: true,
        },
        lastname : {
            type : String,
            required: true,
        },
        role : {
            type : String,
            default : 'user',
            enum: ['user', 'kasir', 'admin']
        },
        accessToken : {
            type : String
        }

    }
)

const User = mongoose.model('User', userSchema)
export default User