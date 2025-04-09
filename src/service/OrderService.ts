import { Op } from "sequelize";
import { zones } from "../const/zones";
import { DatabaseError } from "../error/DatabaseError";
import { RequestError } from "../error/RequestError";
import { Detail, Order } from "../models";
import { IOrder, IOrderItem, IOrderReq, IOrderRes, TMethodOfReceipt, TMethodPayment, TStatus } from "../models/order/types";
import { detailService } from "./DetailService";
import { productService } from "./ProductService";
import { shopProductService } from "./ShopProductService";
import { yandexMapService } from "./YandexMapService";
import { shopService } from "./ShopService";

const getAddressFormat = (address: IOrderReq['address']) => {
    return address.street + (address.entrance ? (', подъезд ' + address.entrance) : '') + (address.floor ? (', этаж ' + address.floor) : '') + (address.apartment ? ', кв.' + address.apartment : '');
}

class OrderService {
    
    async create(
        senderName: string, senderPhone: string, recipientName: string, recipientPhone: string, address: string, deliveryMessage: string, deliveryPrice: number, ShopId: number, message: string, methodOfReceipt: TMethodOfReceipt, methodPayment: TMethodPayment) 
    {
        return await Order.create(
            {
                senderName, senderPhone, recipientName, recipientPhone, address, ShopId, statusOrder: 'Pending', deliveryMessage, deliveryPrice, statusPayment: 'Не оплачен', message, methodOfReceipt, methodPayment
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }

    async createOrder(order: IOrderReq): Promise<number> {
        
        if(order.methodOfReceipt === 'Доставка'){
            const coords = await yandexMapService.getCoordinates(order.address.street)
            if(!coords) {
                throw RequestError.BadRequest('Нет адреса доставки')
            }
            const MIN = 10000;
            let minPrice = MIN;  // итоговая цена доставки
            for(let polygon of zones){
                const inside = yandexMapService.isPointInPolygon(coords, polygon.coords)
                if(inside && minPrice > polygon.price){
                    minPrice = polygon.price;
                }
            }
            if(MIN === minPrice){
                throw RequestError.BadRequest('Нет доставки по указанному адресу')
            }
            const orderData = await this.create(order.senderName, order.senderPhone, order.recipientName, order.recipientPhone, getAddressFormat(order.address), order.address.message, minPrice, order.shopId, order.message, order.methodOfReceipt, order.methodPayment)
            await this.productsCreate(order.products, order.shopId, orderData.id)
            return orderData.id
        }
        else{
            if(order.methodPayment === 'При получении'){
                const orderData = await this.create(order.senderName, order.senderPhone, order.recipientName, order.recipientPhone, '', order.address.message, 0, order.shopId, order.message, order.methodOfReceipt, 'При получении')
                await this.productsCreate(order.products, order.shopId, orderData.id)
                return orderData.id
            }
            return 0
        }
    }


    async productsCreate(products: IOrderReq['products'], shopId: number, orderId: number){
        await Promise.all(products.map(async product => {
            const productData = await productService.getById(product.id)
            const productCountInShop = await shopProductService.countProduct(shopId, product.id)
            if(productCountInShop < product.count){
                throw RequestError.BadRequest(`В магазине всего ${productCountInShop} единиц товара. Вы хотите купить ${product.count} единиц товара`)
            }
            if(!productData) throw DatabaseError.NotFound(`Продукт с id=${product.id} не найден`)
            await detailService.create(orderId, productData.id, productData.price, product.count)
        }))
    }
    // async updateStatus(id: number, status: TStatus){
    //     return await Order.update({status}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    // }

    // async createOrder(order: IOrder, details: IDetail[]){
    //     const orderData = await this.create(order.name, order.phone, order.message, order.address, order.UserId, order.ShopId)

    //     await Promise.all(details.map(async detail => {
    //         await detailService.create(orderData.id, detail.ProductId, detail.price, detail.count)
    //     }))
    // }

    async getProductsAndFullPrice(details: Detail[]): Promise<{products: IOrderItem['products'], fullPrice: number}> {
        let fullPrice = 0;
        const products = await Promise.all(details.map(async detail => {
            const data = await productService.getImage(detail.ProductId)
            if(!data) throw DatabaseError.NotFound(`Не найдено изображения продукта с id=${detail.ProductId}`)
            fullPrice += detail.price * detail.count;
            const res: IOrderItem['products'][0] = {
                image: data.image,
                count: detail.count
            }
            return res
        }))

        return {products, fullPrice}
    }

    async getFullData(ordersData: Order[]) {
        const orders: IOrderItem[] = await Promise.all(ordersData.map(async orderData => {
            const details = await detailService.get(orderData.id)
            const {products, fullPrice} = await this.getProductsAndFullPrice(details)
            const res: IOrderItem = {
                id: orderData.id,
                date: '27 марта 2025',
                fullPrice,
                products,
                methodOfReceipt: orderData.methodOfReceipt,
                methodPayment: orderData.methodPayment,
                statusOrder: orderData.statusOrder,
                statusPayment: orderData.statusPayment,
                
            }
            return res
        }))
        return orders
    }

    async getShop(ShopId: number, active: boolean, page: number, limit: number) {
        const offset = (page - 1) * limit; 
        const ordersData = await Order.findAll(
            active
                ?
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.notIn]: ['Выдан', 'Отменен']
                    }
                },
                limit,
                offset,
            }
                :
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.in]: ['Выдан', 'Отменен']
                    }
                },
                limit,
                offset,
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const ordersRes: IOrderItem[] = await this.getFullData(ordersData)
        return ordersRes
    }

    async getUser(phone: string, active: boolean) { 
        const ordersData = await Order.findAll(
            active
                ?
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.notIn]: ['Выдан', 'Отменен']
                    }
                }
            }
                :
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.in]: ['Выдан', 'Отменен']
                    }
                }
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const ordersRes: IOrderItem[] = await this.getFullData(ordersData)
        return ordersRes
    }

    async getFull(id: number): Promise<IOrderRes> {
        const orderData = await Order.findOne({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!orderData) throw DatabaseError.NotFound(`Нет заказа с id=${id}`)
        const shopData = await shopService.getById(orderData.ShopId)
        if(!shopData) throw DatabaseError.NotFound(`Не найден магазин с id=${orderData.ShopId}`)
        const details = await detailService.get(orderData.id)
        const products: IOrderRes['products'] = await Promise.all(details.map(async detail => {
            const product = await productService.getItem(detail.ProductId)
            if(!product) throw DatabaseError.NotFound(`Не найден продукт с id=${detail.ProductId}`)
            return {...product, count: detail.count}
        }))
        
        return {
            id: orderData.id,
            date: '27 марта 2025',
            products,
            message: orderData.message,
            messageDelivery: 'надо сделать',
            methodOfReceipt: orderData.methodOfReceipt,
            methodPayment: orderData.methodPayment,
            senderName: orderData.senderName,
            senderPhone: orderData.senderPhone,
            recipientName: orderData.recipientName,
            recipientPhone: orderData.recipientPhone,
            address: orderData.address,
            deliveryMessage: orderData.deliveryMessage,
            deliveryPrice: orderData.deliveryPrice,
            shop: {
                title: shopData.title,
                address: shopData.address,
                openingHours: shopData.openingHours
            },
            statusPayment: orderData.statusPayment,
            statusOrder: orderData.statusOrder
        }
    }

    
    async getCountShop(ShopId: number, active: boolean){
        const count = await Order.count(
            active
                ?
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.notIn]: ['Выдан', 'Отменен']
                    }
                }
            }
                :
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.in]: ['Выдан', 'Отменен']
                    }
                }
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return count
    }

    async getCountUser(phone: string, active: boolean){
        const count = await Order.count(
            active
                ?
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.notIn]: ['Выдан', 'Отменен']
                    }
                }
            }
                :
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.in]: ['Выдан', 'Отменен']
                    }
                }
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return count
    }

    async updateStatus(id: number, status: TStatus){
        return await Order.update({statusOrder: status}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

}

export const orderService = new OrderService()