import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface decodedJwt {
    userId:string;
    userName : string,
    password : string,
    iat:number,
    exp:number
}

const verifyToken = (req:Request, res:Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(403).json({ message: "No Authorization Token" });
        }
        else {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!, (err, decoded: any) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                const decodedToken = jwt.decode(token)
                req.body.userId = (decodedToken! as unknown as decodedJwt).userId
                req.body.userName = (decodedToken! as unknown as decodedJwt).userName
                next();
            });
        }
    } catch (error) {
        res.status(403).json({ message: "Authentication failed" });
    }
};

export default verifyToken;
