import express from 'express';
import mongoDb from './db';
import dotenv from 'dotenv';
import authRoutes from './routes/authentication'
import crudRoutes from './routes/usercrud'
import cors from 'cors'

dotenv.config()


mongoDb()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/crud',crudRoutes)

app.listen(process.env.BACKEND_PORT,()=>{
    console.log(`listening to port ${process.env.BACKEND_PORT}`);
})