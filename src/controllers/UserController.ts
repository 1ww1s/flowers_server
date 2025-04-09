import { CookieOptions, NextFunction, Request, Response } from "express";
import { IUserAuth, IUser, IUserDto } from "../models";
import { RequestError } from "../error/RequestError";
import { userService } from "../service/UserService";
import { AuthError } from "../error/AuthError";
import { validationResult } from "express-validator";
import { basketService } from "../service/BasketService";
import { DatabaseError } from "../error/DatabaseError";
import { IOrderReq } from "../models/order/types";
import { orderService } from "../service/OrderService";

const cookieOptions: CookieOptions = {
    maxAge: 1 * 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
}

class UserController {

    async registration(req: Request<never, never, IUser, never>, res: Response, next: NextFunction){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(AuthError.BadRequest(errors.array()[0].msg))
            }
            const {phone, password, name} = req.body;            
            if(!phone || !password || !name) throw RequestError.BadRequest('Нет одного из обязательных параметров')
            const {userRes, access, refresh} = await userService.registration(phone, password, name)
            res.cookie('token', refresh, cookieOptions)
            res.json({user: userRes, accessToken: access})
        }
        catch(e){
            next(e)
        }
    }

    async login(req: Request<never, never, IUserAuth, never>, res: Response, next: NextFunction){
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(AuthError.BadRequest(errors.array()[0].msg))
            }
            const {phone, password} = req.body;
            if(!phone || !password) throw RequestError.BadRequest('Нет email или пароля')
            const {userRes, access, refresh} = await userService.login(phone, password)
            console.log(refresh)
            res.cookie('token', refresh, cookieOptions)
            res.json({user: userRes, accessToken: access})
        }
        catch(e){
            next(e)
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction){
        try{
            const token = req.cookies.token;
            if(!token) throw AuthError.UnauthorizedError()
            const {userRes, access, refresh} = await userService.refresh(token)
            res.cookie('token', refresh, cookieOptions)
            res.send({user: userRes, accessToken: access})
        }
        catch(e){
            next(e)
        }
    }

    async check(req: Request<any, any, {user: IUserDto}>, res: Response, next: NextFunction){
        try{
            if(!req.body.user) throw RequestError.BadRequest('Нет объекта "Пользователь"')
                res.send({user: req.body.user})
        }
        catch(e){
            next(e)
        }
    }

    async orderCreate(req: Request<never, never, {order: IOrderReq}>, res: Response, next: NextFunction){
        try{
            const {order} = req.body;
            if(!order) throw RequestError.BadRequest('Нет объекта заказа')
            const orderId = await orderService.createOrder(order)
            if(!orderId)  
                throw RequestError.BadRequest('Заказ не был оформлен (данный формат оформления заказа не поддерживается)')
            res.send({orderId})
        }
        catch(e){
            next(e)
        }
    }

    async ordersCount(req: Request<never, never, {user: IUserDto, active: boolean}>, res: Response, next: NextFunction){
        try{
            const {user, active} = req.body;
            if(active === undefined) throw RequestError.BadRequest('Не указано значение active')
            const count = await orderService.getCountUser(user.phone, active)
            res.send({count})
        }
        catch(e){
            next(e)
        }
    }

    async basketAdd(req: Request<any, any, {user: IUserDto, item: {id: number, count: number}}>, res: Response, next: NextFunction){
        try{
            const {user, item} = req.body;
            const userData = await userService.get(user.phone)
            await basketService.create(item.id, userData.id, item.count)
            // await new Promise(resolve => setTimeout(resolve, 2000))
            res.json({message: 'Корзина обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    async basketDelete(req: Request<any, any, {user: IUserDto, ProductId: number}>, res: Response, next: NextFunction){
        try{
            const {user, ProductId} = req.body;
            const userData = await userService.get(user.phone)
            const baketTarget = await basketService.get(userData.id, ProductId)
            if(!baketTarget) throw DatabaseError.NotFound(`Товар с id=${ProductId} не найден в корзине`)
            await basketService.delete(baketTarget.id)
            // await new Promise(resolve => setTimeout(resolve, 2000))
            res.json({message: 'Товар удален из корзины'})
        }
        catch(e){
            next(e)
        }
    }

    async basketGetAll(req: Request<any, any, {user: IUserDto}>, res: Response, next: NextFunction){
        try{
            const {user} = req.body;
            const userData = await userService.get(user.phone)
            const basket = await basketService.getAllByUser(userData.id)
            res.json(basket)
        }
        catch(e){
            next(e)
        }
    }

    async basketCountUpdate(req: Request<any, any, {user: IUserDto, productId: number, count: number}>, res: Response, next: NextFunction){
        try{
            const {user, productId, count} = req.body;
            const userData = await userService.get(user.phone)
            const basket = await basketService.get(userData.id, productId)
            if(!basket) throw DatabaseError.NotFound(`Продукт с id=${productId} не найдет в корзине пользователя`)
            await basketService.update(basket.id, count)
            // await new Promise(resolve => setTimeout(resolve, 2000))
            res.json(basket)
        }
        catch(e){
            next(e)
        }
    }

    async getOrders(req: Request<any, any, {user: IUserDto, active: boolean}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {user, active} = req.body;
            if (active === undefined) throw RequestError.BadRequest('Не указано значение active')
            const orders = await orderService.getUser(user.phone, active)
            res.send(orders)
        }
        catch(e){
            next(e)
        }
    }

    async basketAddItems(req: Request<any, any, {user: IUserDto, basket: {id: number, count: number}[]}>, res: Response, next: NextFunction){
        try{
            const {user, basket} = req.body;
            const userData = await userService.get(user.phone)
            const basketDelete: number[] = []
            await Promise.all(basket.map(async (b) => {
                const deleteProduct = await basketService.create(b.id, userData.id, b.count)
                if(deleteProduct) basketDelete.push(deleteProduct)
            }))
            res.json(basketDelete)
        }
        catch(e){
            next(e)
        }
    }
}

export const userController = new UserController()