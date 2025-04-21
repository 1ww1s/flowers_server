import {Router} from 'express'
import { userController } from '../controllers/UserController'
import { AuthMiddleware } from '../middleware/AuthMiddleware'
import {body} from 'express-validator'

const userRouter = Router()

userRouter.post('/registration', 
    body('phone').isMobilePhone(['ru-RU']).withMessage('Такой формат номера не поддерживается'),
    body('password').isLength({min: 6, max: 20}).withMessage('Пароль должен содержать от 6 до 20 символов'),
    body('name').isLength({min: 2, max: 20}).withMessage('Имя должно содержать от 2 до 20 букв'),
    userController.registration)

userRouter.post('/login',
    body('phone').isMobilePhone(['ru-RU']).withMessage('Такой формат номера не поддерживается'),
    body('password').isLength({min: 6, max: 20}).withMessage('Пароль должен содержать от 6 до 20 символов'),
    userController.login)

userRouter.get('/logout', AuthMiddleware, userController.logout)

userRouter.get('/refresh', userController.refresh)
userRouter.get('/check', AuthMiddleware, userController.check)

userRouter.post('/orders/count', AuthMiddleware, userController.ordersCount)
userRouter.post('/orders', AuthMiddleware, userController.getOrders)

userRouter.post('/basket/add', AuthMiddleware, userController.basketAdd)
userRouter.post('/basket/add/items', AuthMiddleware, userController.basketAddItems)
userRouter.post('/basket/delete', AuthMiddleware, userController.basketDelete)
userRouter.get('/basket/get', AuthMiddleware, userController.basketGetAll)
userRouter.post('/basket/count/update', AuthMiddleware, userController.basketCountUpdate)


export { userRouter }