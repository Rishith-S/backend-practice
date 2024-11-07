import mongoose from "mongoose";
import User from "./user";


const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:User
    },
    balance: {
        type:Number,
        required: true,
        default:0
    }
})

const Account = mongoose.model('Account',accountSchema)
export default Account