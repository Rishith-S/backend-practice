"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const signUpSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(3, { message: 'First Name must be atleast 3 characters' }).max(50, { message: 'First Name can be upto 50 characters' }),
    lastName: zod_1.z.string().max(50, { message: 'Last Name can be upto 50 characters' }),
    userName: zod_1.z.string().email({ message: 'Invalid user name' }),
    password: zod_1.z.string()
});
const signInSchema = zod_1.z.object({
    userName: zod_1.z.string().email({ message: 'Invalid user name' }),
    password: zod_1.z.string().min(6, { message: 'Password must be atleast 6 characters' })
});
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, userName, password } = req.body;
        const vConst = signUpSchema.safeParse({ firstName, lastName, userName, password });
        if (vConst.success) {
            const bcryptPassword = yield bcrypt_1.default.hash(password, 10);
            const accessToken = yield jsonwebtoken_1.default.sign({
                userName,
                bcryptPassword
            }, process.env.JWT_ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            const refreshToken = yield jsonwebtoken_1.default.sign({
                userName,
                bcryptPassword
            }, process.env.JWT_REFRESH_TOKEN_SECRET, {
                expiresIn: '3d'
            });
            yield user_1.default.create({
                firstName,
                lastName,
                userName,
                password: bcryptPassword,
                refreshToken
            });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
            res.status(200).json({
                message: "User created successfully",
                token: accessToken
            });
        }
        else {
            res.status(411).json(vConst.error);
        }
    }
    catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/signup');
    }
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, password } = req.body;
        const vConst = signInSchema.safeParse({
            userName, password
        });
        if (vConst.success) {
            const user = yield user_1.default.findOne({
                userName
            });
            if (!user) {
                res.status(411).json({ message: 'Incorrect UserName' });
            }
            else {
                const verifyPassword = yield bcrypt_1.default.compare(password, user.password);
                if (verifyPassword) {
                    const accessToken = jsonwebtoken_1.default.sign({
                        userName,
                        password: user.password
                    }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
                    res.status(200).json({
                        message: 'success',
                        accessToken
                    });
                }
                else {
                    res.status(411).json({ message: 'Incorrect Password' });
                }
            }
        }
        else {
            res.status(411).json({ message: vConst.error });
        }
    }
    catch (error) {
        console.log(error);
        res.status(411).json('Internal Server Error /api/v1/signin');
    }
}));
router.get('/refresh', (req, res) => {
});
exports.default = router;
//# sourceMappingURL=authentication.js.map