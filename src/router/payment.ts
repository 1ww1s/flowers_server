import {Router} from 'express'

import { paymentController } from '../controllers/PaymentController'

const paymentRouter = Router()

paymentRouter.post('/webhook', paymentController.webhook)

export {paymentRouter}