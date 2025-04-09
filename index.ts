import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import {connection, Order} from './src/models'
import { router } from './src/router'
import cors from 'cors'
import { ErrorMiddleware as error } from './src/middleware/ErrorMiddleware'
import parser from 'cookie-parser'

const app = express()

const port = process.env.PORT_SERVER || 5000;


app.use(cors({
    credentials: true,
    maxAge: 24 * 60 * 60,  // 24h
    origin: 'http://localhost:3000'
}))
app.use(express.json({limit: '50mb'}))
app.use(parser())
app.use('/api', router)
app.use(error)


const start = async () => {
    await connection.authenticate()
    await connection.sync()
    app.listen(port, () => console.log(`Running on port ${port}`))
}
start()