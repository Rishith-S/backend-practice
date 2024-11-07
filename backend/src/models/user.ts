import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required:true,
        trim:true,
        maxLength:50,
    },
    lastName : {
        type:String,
        trim:true,
        maxLength:50,
    },
    userName : {
        type:String,
        required:true,
        trim:true,
        maxLength:50,
        unique:true,
        minLength:3,
    },
    password : {
        type: String,
        required: true,
    },
    refreshToken : {
        type: String,
    }
})

const User = mongoose.model('User',userSchema)

export default User