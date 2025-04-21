import { NextFunction, Request, Response } from "express";
import { itemService } from "../service/ItemService";
import { RequestError } from "../error/RequestError";
import { categoryService } from "../service/CategoryService";
import { IBanner, IBasket, IBasketProducts, ICategory, ICategoryCharacteristic, ICharacteristic, ICharacteristicValue, IItem, IProductReq, IRole, IShop, TStatus } from "../models";
import { productService } from "../service/ProductService";
import { characteristicService } from "../service/CharacteristicService";
import { roleService } from "../service/RoleService";
import { basketService } from "../service/BasketService";
import { characteristicValueService } from "../service/CharacteristicValueService";
import { categoryCharacteristicService } from "../service/CategoryCharacteristicService";
import { userService } from "../service/UserService";
import { DatabaseError } from "../error/DatabaseError";
import { shopService } from "../service/ShopService";
import { bannerService } from "../service/BannerService";
import { orderService } from "../service/OrderService";
import { limitOrders } from "../const/limits";
import { paymentService } from "../service/PaymentService";

class AdminController {

    // Basket
    async basketCreate(req: Request<any, any, IBasket>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {ProductId, UserId, count = 1} = req.body;
            if(!ProductId || !UserId) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await basketService.create(ProductId, UserId, count)
            res.send({message: 'Товар добавлен в корзину'})
        }
        catch(e){
            next(e)
        }
    }

    async bannerCreate(req: Request<any, any, IBanner>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {title, sign, buttonLink, image} = req.body;
            if(!title || !buttonLink || !image) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await bannerService.create(title, 'sign', image, buttonLink)
            res.send({message: 'Баннер создан'})
        }
        catch(e){
            next(e)
        }
    }

    async bannerUpdate(req: Request<any, any, IBanner>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {id, title, sign, buttonLink, image} = req.body;
            if(!id || !title || !sign || !buttonLink || !image) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await bannerService.update(id, title, sign, image, buttonLink)
            res.send({message: 'Баннер обнавлен'})
        }
        catch(e){
            next(e)
        }
    }

    async bannerDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id баннера')
            await bannerService.delete(id)
            res.send({message: 'Баннер удален'})
        }
        catch(e){
            next(e)
        }
    }


    async getBannerStartsWith(req: Request<any, any, {title: string}>, res: Response, next: NextFunction){
        try{
            const {title} = req.body;
            if(!title) throw RequestError.BadRequest('Не указано название баннера')
            const banners = await bannerService.getStartsWith(title)
            res.send(banners)
        }
        catch(e){
            next(e)
        }
    }

    async bannerGet(req: Request<any, any, {title: string}>, res: Response, next: NextFunction){
        try{
            const {title} = req.body;
            if(!title) throw RequestError.BadRequest('Нет наименования категории')
            const bannerData = await bannerService.getByTitle(title)
            const banner: IBanner = {
                id: bannerData.id,
                title: bannerData.title,
                sign: bannerData.sign,
                image: bannerData.image,
                buttonLink: bannerData.buttonLink
            }
            res.send(banner)
        }
        catch(e){
            next(e)
        }
    }

    async basketDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id 
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id')
            await basketService.delete(id)
            res.send({message: 'Товар удален из корзины'})
        }
        catch(e){
            next(e)
        }
    }

    async basketUpdate(req: Request<any, any, IBasketProducts>, res: Response, next: NextFunction){ // синхронизация корзины на клиенте и в бд
        try{
            const {UserId, products} = req.body;
            if(!UserId || !products) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await basketService.updateAll(UserId, products)
            res.send({message: 'Корзина обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    // Item
    async itemCreate(req: Request<any, any, IItem>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Нет свойства name')
            await itemService.create(name)
            res.send({message: 'Создана единица товара'})
        }
        catch(e){
            next(e)
        }
    }
    
    async itemUpdate(req: Request<any, any, IItem>, res: Response, next: NextFunction){
        try{
            const {id, name} = req.body;
            if(!id || !name) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await itemService.update(id, name)
            res.send({message: 'Единица товара обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    async itemDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id')
            await itemService.delete(id)
            res.send({message: 'Единица товара удалена'})
        }
        catch(e){
            next(e)
        }
    }

    async getItemsStartsWith(req: Request<any, any, {name: string}>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            // await new Promise(resolve => setTimeout(resolve, 2000))
            if(!name) throw RequestError.BadRequest('Нет названия единицы товара')
            const names = await itemService.getStartsWith(name)
            res.send(names)
        }
        catch(e){
            next(e)
        }
    }

    // Category

    async categoryCreate(req: Request<any, any, ICategory>, res: Response, next: NextFunction){
        try{
            const {name, image} = req.body;
            if(!name || !image) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await categoryService.create(name, image)
            res.send({message: 'Создана категория для товаров'})
        }
        catch(e){
            next(e)
        }
    }

    async categoryUpdate(req: Request<any, any, ICategory>, res: Response, next: NextFunction){
        try{
            const {id, name, image} = req.body;
            if(!id || !name || !image) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await categoryService.update(id, name, image)
            res.send({message: 'Категория для товаров обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    async categoryStartsWith(req: Request<any, any, {name: string}>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Нет наименования категории')
            const names: string[] = await categoryService.getStartsWith(name)
            res.send(names)
        }
        catch(e){
            next(e)
        }
    }

    async categoryGet(req: Request<any, any, {name: string}>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Нет наименования категории')
            const categoryData = await categoryService.getByName(name)
            if(!categoryData) throw DatabaseError.NotFound(`Категория с name=${name} не найдена`)
            const category: ICategory = {
                id: categoryData.id,
                name: categoryData.name,
                slug: categoryData.slug,
                image: categoryData.image,
            }
            res.send(category)
        }
        catch(e){
            next(e)
        }
    }

    async categoryCharacteristicAdd(req: Request<any, any, ICategoryCharacteristic>, res: Response, next: NextFunction){
        try{
            const {CategoryId, CharacteristicId} = req.body;
            if(!CategoryId || !CharacteristicId) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await categoryCharacteristicService.create(CategoryId, CharacteristicId)
            res.send({message: 'Характеристика для категория добавлена'})
        }
        catch(e){
            next(e)
        }
    }

    async categoryCharacteristicDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id')
            await categoryCharacteristicService.delete(id)
            res.send({message: 'Характеристика для категория удалена'})
        }
        catch(e){
            next(e)
        }
    }

    // Product

    async productCreate(req: Request<any, any, IProductReq>, res: Response, next: NextFunction){
        try{
            const {data, composition, characteristics, shops, categories} = req.body;
            if(!data || !composition || !characteristics || !shops || !categories) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await productService.createAll(data, categories, composition, characteristics, shops)
            res.send({message: 'Создан товар'})
        }
        catch(e){
            next(e)
        }
    }

    async productUpdate(req: Request<any, any, IProductReq>, res: Response, next: NextFunction){
        try{
            const {data, composition, characteristics, categories, shops} = req.body;
            console.log(categories)
            if(!data || !composition || !characteristics || !shops || !categories) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await productService.updateAll(data, categories, composition, characteristics, shops)
            res.send({message: 'Товар обновлен'})
        }
        catch(e){
            next(e)
        }
    }

    async productDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id продукта')
            await productService.delete(id)
            res.send({message: 'Товар удален'})
        }
        catch(e){
            next(e)
        }
    }


    async productStartsWith(req: Request<any, any, {name: string}>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Нет наименования продукта')
            const names: {name: string, slug: string}[] = await productService.getStartsWith(name)
            res.send(names)
        }
        catch(e){
            next(e)
        }
    }

    async getPreview(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug
            if(!slug) throw RequestError.BadRequest('Нет slug продукта')
            const preview = await productService.getPreview(slug)
            res.send(preview)
        }
        catch(e){
            next(e)
        }
    }


    // Characteristic

    async characteristicCreate(req: Request<any, any, ICharacteristic>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await characteristicService.createWithCategory(name)
            res.send({message: 'Характеристика для категории создана'})
        }
        catch(e){
            next(e)
        }
    }

    async characteristicUpdate(req: Request<any, any, ICharacteristic>, res: Response, next: NextFunction){
        try{
            const {id, name} = req.body;
            if(!id || !name) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await characteristicService.upate(id, name)
            res.send({message: 'Характеристика для категории обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    async characteristicDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id')
            await characteristicService.delete(id)
            res.send({message: 'Характеристика для категории удалена'})
        }
        catch(e){
            next(e)
        }
    }

    async characteristicStartsWith(req: Request<any, any, {name: string}>, res: Response, next: NextFunction){
        try{
            const {name} = req.body;
            if(!name) throw RequestError.BadRequest('Нет названия характеристики')
            const names: string[] = await characteristicService.getStartsWith(name)
            res.send(names)
        }
        catch(e){
            next(e)
        }
    }

    // CharacteristicValue

    async characteristicValueCreate(req: Request<any, any, ICharacteristicValue>, res: Response, next: NextFunction){
        try{
            const {value, CharacteristicId} = req.body;
            if(!value || !CharacteristicId) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await characteristicValueService.create(value, CharacteristicId)
            res.send({message: 'Значение для характеристики создана'})
        }
        catch(e){
            next(e)
        }
    }

    async characteristicValueUpdate(req: Request<any, any, ICharacteristicValue>, res: Response, next: NextFunction){
        try{
            const {id, value} = req.body;
            if(!id || !value) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await characteristicValueService.update(id, value)
            res.send({message: 'Значение для характеристики обновлено'})
        }
        catch(e){
            next(e)
        }
    }

    async characteristicValueDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('нет id')
            await characteristicValueService.delete(id)
            res.send({message: 'Значение для характеристики удалено'})
        }
        catch(e){
            next(e)
        }
    }
    async getCharacteristicsValuesStartsWith(req: Request<any, any, {value: string; characteristicName: string}>, res: Response, next: NextFunction){
        try{
            const {value, characteristicName} = req.body;
            // await new Promise(resolve => setTimeout(resolve, 2000))
            if(!value || !characteristicName) throw RequestError.BadRequest('Нет значения или имени характеристики')
            const values = await characteristicValueService.getCharacteristicsByStartsWith(value, characteristicName)
            res.send(values)
        }
        catch(e){
            next(e)
        }
    }

    async getCharacteristics(req: Request, res: Response, next: NextFunction){
        try{
            // await new Promise(resolve => setTimeout(resolve, 2000))
            const data = await characteristicService.getAll()
            const characteristics = data.map(characteristic => characteristic.name)
            res.send(characteristics)
        }
        catch(e){
            next(e)
        }
    }

    // Role

    async roleCreate(req: Request<any, any, IRole>, res: Response, next: NextFunction){
        try{
            const {role} = req.body;
            if(!role) throw RequestError.BadRequest('Отсутствует роль')
            await roleService.create(role)
            res.send({message: 'Роль создана'})
        }
        catch(e){
            next(e)
        }
    }

    async roleUpdate(req: Request<any, any, IRole>, res: Response, next: NextFunction){
        try{
            const {id, role} = req.body;
            if(!id || !role) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await roleService.update(id, role)
            res.send({message: 'Роль обновлена'})
        }
        catch(e){
            next(e)
        }
    }

    async roleGetAll(req: Request, res: Response, next: NextFunction){
        try{
            const roles = await roleService.getAll()
            res.send(roles)
        }
        catch(e){
            next(e)
        }
    }

    // User 
    
    async getUser(req: Request<any, any, {phone: string}>, res: Response, next: NextFunction){
        try{
            const {phone} = req.body;
            if(!phone) throw RequestError.BadRequest('Не указан телефона пользователя')
            const user = await userService.getWithRoles(phone)
            res.send(user)
        }
        catch(e){
            next(e)
        }
    }

    async getUserStartsWith(req: Request<any, any, {phone: string}>, res: Response, next: NextFunction){
        try{
            const {phone} = req.body;
            if(!phone) throw RequestError.BadRequest('Не указан телефона пользователя')
            const user = await userService.getStartsWith(phone)
            res.send(user)
        }
        catch(e){
            next(e)
        }
    }

    async userRolesUpdate(req: Request<any, any, {phone: string, roles: string[]}>, res: Response, next: NextFunction){
        try{
            const {phone, roles} = req.body;
            if(!phone || !roles) throw RequestError.BadRequest('Не указан телефона пользователя или его роли')
            await userService.rolesUpdate(phone, roles)
            res.send({message: 'Роли пользователя обновлены'})
        }
        catch(e){
            next(e)
        }
    }


    // Shop

    async getShopStartsWith(req: Request<any, any, {title: string}>, res: Response, next: NextFunction){
        try{
            const {title} = req.body;
            if(!title) throw RequestError.BadRequest('Не указано название магазина')
            const shops: {title: string, slug: string}[] = await shopService.getStartsWith(title)
            res.send(shops)
        }
        catch(e){
            next(e)
        }
    }

    async getShopOptions(_: Request, res: Response, next: NextFunction){
        try{
            const options = await shopService.getOptions()
            res.send(options)
        }
        catch(e){
            next(e)
        }
    }

    async shopCreate(req: Request<any, any, IShop>, res: Response, next: NextFunction){
        try{
            const {title, address, openingHours, coordinateX, coordinateY} = req.body;
            if(!address || !openingHours || !coordinateX || !coordinateY || !title) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await shopService.create(title, address, openingHours, coordinateX, coordinateY)
            res.send({message: 'Магазина создан'})
        }
        catch(e){
            next(e)
        }
    }

    async shopUpdate(req: Request<any, any, IShop>, res: Response, next: NextFunction){
        try{
            const {id, title, address, openingHours, coordinateX, coordinateY} = req.body;
            if(!id || !address || !title || !openingHours || !coordinateX || !coordinateY) throw RequestError.BadRequest('Одно из свойств отсутствует')
            await shopService.update(id, title, address, openingHours, coordinateX, coordinateY)
            res.send({message: 'Магазин обновлен'})
        }
        catch(e){
            next(e)
        }
    }

    // Orders

    async getOrdersShop(req: Request<any, any, {ShopId: number, active: boolean, page: number}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {ShopId, active, page} = req.body;
            if(!ShopId || (active === undefined)) throw RequestError.BadRequest('Нет id магазина или переменной "active"')
            const orders = await orderService.getShop(ShopId, active, page || 1, limitOrders)
            res.send(orders)
        }
        catch(e){
            next(e)
        }
    }

    async getOrdersShopCount(req: Request<any, any, {ShopId: number, active: boolean}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {ShopId, active} = req.body;
            if(!ShopId || (active === undefined)) throw RequestError.BadRequest('Нет id магазина или переменной "active"')
            const count = await orderService.getCountShop(ShopId, active)
            res.send({count, totalPage: (count / limitOrders).toFixed()})
        }
        catch(e){
            next(e)
        }
    }

    async getOrdersUser(req: Request<any, any, {phone: string, active: boolean, page: number}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {phone, active, page} = req.body;
            if(!phone || (active === undefined)) throw RequestError.BadRequest('Нет телефона пользователя или переменной "active"')
            const orders = await orderService.getUser(phone, active, page || 1, limitOrders)
            res.send(orders)
        }
        catch(e){
            next(e)
        }
    }

    async getOrdersUserCount(req: Request<any, any, {phone: string, active: boolean}>, res: Response, next: NextFunction){ // по элементно, если пользователь в системе, чтобы знать id
        try{
            const {phone, active} = req.body;
            if(!phone || (active === undefined)) throw RequestError.BadRequest('Нет телефона пользователя или переменной "active"')
            const count = await orderService.getCountUser(phone, active)
            res.send({count, totalPage: (count / limitOrders).toFixed()})
        }
        catch(e){
            next(e)
        }
    }

    async updateOrderStatus(req: Request<any, any, {id: number, status: TStatus}>, res: Response, next: NextFunction){
        try{
            const {id, status} = req.body;
            if(!id || !status) throw RequestError.BadRequest('Нет id или статуса заказа')
            await orderService.updateStatus(id, status)
            let message = 'Статус заказа успешно обновлен';
            if(status === 'Отменен'){
                const order = await orderService.get(id)
                if (!order) throw DatabaseError.NotFound(`Заказ с id=${id} не найден`)
                const refund = await paymentService.createFullRefund(order.paymentId)
                if (refund.status === 'pending'){
                    throw RequestError.BadRequest('Refund delayed')
                } else if (refund.status === 'canceled') {
                    throw RequestError.BadRequest(`${refund.cancellation_details?.party}`)
                } else{
                    throw RequestError.BadRequest('Неизвестная ошибка')
                }
            }
            res.send({message})
        }
        catch(e){
            next(e)
        }
    }

    async shopDelete(req: Request<any, any, {id: number}>, res: Response, next: NextFunction){
        try{
            const {id} = req.body;
            if(!id) throw RequestError.BadRequest('Нет id')
            await shopService.delete(id)
            res.send({message: 'Магазин удален'})
        }
        catch(e){
            next(e)
        }
    }
    

    // // ShopProduct

    // async shopProduct(req: Request<any, any, {ProductId: number, shops: IShopProduct[]}>, res: Response, next: NextFunction){
    //     try{
    //         const {ProductId, shops} = req.body;
    //         if(!ProductId || !shops) throw RequestError.BadRequest('Одно из свойств отсутствует')
    //         await shopProductService.updateAll(ProductId, shops)
    //         res.send('Наличие в магазинах обновлено')
    //     }
    //     catch(e){
    //         next(e)
    //     }
    // }

    
}

export const adminController = new AdminController()