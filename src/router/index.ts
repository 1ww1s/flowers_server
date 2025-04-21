import express from 'express' 
import { adminRouter } from './admin'
import { userRouter } from './user'
import { siteRouter } from './site'
import { paymentRouter } from './payment'
import { AuthMiddleware } from '../middleware/AuthMiddleware'
import { CheckRolesMiddleware } from '../middleware/CheckRolesMiddleware'

const router = express.Router()

router.use('/admin', AuthMiddleware, CheckRolesMiddleware(['admin', 'moderator']), adminRouter)
router.use('/user', userRouter)
router.use('/site', siteRouter)

router.use('/payment', paymentRouter)

export {router}