import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { mongo } from 'mongoose';
import verifyToken from '../middlewares/verifyToken';
import Account from '../models/accounts';
import User from '../models/user';

const router = express.Router()

router.put('/change-password', verifyToken, async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword, userName } = req.body;
        const user = await User.findOne({
            userName
        })
        if (!user) {
            res.status(411).json({ message: 'User does not exist' })
        } else {
            const verifyOldPassword = await bcrypt.compare(oldPassword, user?.password!)
            if (!verifyOldPassword) {
                res.status(411).json({ message: 'Old Password does not match' })
            } else {
                const bcryptPassword = await bcrypt.hash(newPassword,10);
                await User.updateOne({userName},{password:bcryptPassword})
                const accessToken = jwt.sign({
                    userName,
                    password:bcryptPassword
                },process.env.JWT_ACCESS_TOKEN_SECRET!,{
                    expiresIn:'1d'
                })
                res.status(200).json({
                    message: 'success',
                    accessToken
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/change-password')
    }
})

router.post('/search-user',verifyToken, async (req,res)=>{
    try {
        const searchString = req.body.searchString || "";
        const users = await User.find({
            $or:[{
                firstName : {
                    "$regex" : searchString.toLowerCase()
                }
            },
            {
                lastName : {
                    "$regex" : searchString.toLowerCase()
                }
            }]
        })
        res.status(200).json({
            message:'success',
            users
        })
    } catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/search-user')
    }
})

router.post('/send-money',verifyToken,async (req,res)=>{
    const {userId,receiverId,amount } = req.body
    const session = await mongoose.startSession()
    await session.startTransaction()
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const sender = await Account.findOne({userId:userObjectId})
        if(sender?.balance!<amount){
            res.status(400).json({message:'Insufficient balance'})
        } else{
            await Account.findOneAndUpdate({userId:userObjectId}, { $inc: { balance: -amount } },{session});
            await Account.findOneAndUpdate({userId:receiverObjectId}, { $inc: { balance: amount } },{session});
            await session.commitTransaction()
            await session.endSession()
            res.status(200).json({message:'Success'})
        }
    } catch (error) {
        console.log(error);
        await session.abortTransaction()
        res.status(411).json('Internal Server Error /api/v1/send-money')
    }
})

router.get('/balance',verifyToken,async (req,res)=>{
    const {userId} = req.body;
    try {
        const userAccount = await Account.findOne({userId:new mongoose.Types.ObjectId(userId)})
        res.status(200).json({message:'Success',balance:userAccount?.balance})
    } catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/send-money')
    }
})

export default router