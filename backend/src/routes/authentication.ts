import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import { SafeParseError, z } from 'zod'
import Account from '../models/accounts'
import User from '../models/user'

const router = express.Router()

const signUpSchema = z.object({
    firstName: z.string().min(3, { message: 'First Name must be atleast 3 characters' }).max(50, { message: 'First Name can be upto 50 characters' }),
    lastName: z.string().max(50, { message: 'Last Name can be upto 50 characters' }),
    userName: z.string().email({ message: 'Invalid user name' }),
    password: z.string()
})

const signInSchema = z.object({
    userName: z.string().email({ message: 'Invalid user name' }),
    password: z.string().min(6, { message: 'Password must be atleast 6 characters' })
})

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, userName, password } = req.body;
        const vConst = signUpSchema.safeParse({ firstName, lastName, userName, password })
        if (vConst.success) {
            const bcryptPassword = await bcrypt.hash(password, 10)
            const refreshToken = await jwt.sign({
                userName,
                bcryptPassword
            }, process.env.JWT_REFRESH_TOKEN_SECRET!, {
                expiresIn: '3d'
            })
            const user = await User.create({
                firstName:firstName.toLowerCase(),
                lastName:lastName.toLowerCase(),
                userName,
                password: bcryptPassword,
                refreshToken
            })
            const accessToken = await jwt.sign({
                userId:user._id,
                userName,
                bcryptPassword
            }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
                expiresIn: '1d'
            })
            await Account.create({
                userId:user._id,
                balance:3000.00
            })
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 })
            res.status(200).json({
                message: "User created successfully",
                token: accessToken
            })
        } else {
            res.status(411).json((vConst as SafeParseError<typeof signUpSchema>).error);
        }
    } catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/signup')
    }
})

router.post('/signin', async (req, res) => {
    try {
        const { userName, password } = req.body;
        const vConst = signInSchema.safeParse({
            userName, password
        })
        if (vConst.success) {
            const user = await User.findOne({
                userName
            })
            if (!user) {
                res.status(411).json({ message: 'Incorrect UserName' })
            } else {
                const verifyPassword = await bcrypt.compare(password, user.password)
                if (verifyPassword) {
                    const accessToken = jwt.sign({
                        userId:user._id,
                        userName,
                        password: user.password
                    }, process.env.JWT_ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
                    res.status(200).json({
                        message: 'success',
                        accessToken
                    })
                } else {
                    res.status(411).json({ message: 'Incorrect Password' })
                }
            }
        } else {
            res.status(411).json({ message: vConst.error })
        }
    } catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/signin')
    }
})

export default router