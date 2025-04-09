import express from 'express' 
import { adminRouter } from './admin'
import { AuthMiddleware } from '../middleware/AuthMiddleware'
import { userRouter } from './user'
import { siteRouter } from './site'

const router = express.Router()

router.use('/admin', adminRouter)
router.use('/user', userRouter)
router.use('/site', siteRouter)

export {router}