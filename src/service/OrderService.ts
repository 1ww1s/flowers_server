import { Op } from "sequelize";
import { zones } from "../const/zones";
import { DatabaseError } from "../error/DatabaseError";
import { RequestError } from "../error/RequestError";
import { Detail, IDetail, Order, TAllTime } from "../models";
import { IOrderItem, IOrderReq, IOrderRes, TMethodOfReceipt, TMethodPayment, TStatus, TStatusPayment } from "../models/order/types";
import { detailService } from "./DetailService";
import { productService } from "./ProductService";
import { shopProductService } from "./ShopProductService";
import { yandexMapService } from "./YandexMapService";
import { shopService } from "./ShopService";
import { paymentService } from "./PaymentService";

const orderCompleted = ['Выдан', 'Отменен'] 
const orderActive = ['Выдан', 'Отменен', 'pending'] 

const getAddressFormat = (address: IOrderReq['address']) => {
    return address.street + (address.entrance ? (', подъезд ' + address.entrance) : '') + (address.floor ? (', этаж ' + address.floor) : '') + (address.apartment ? ', кв.' + address.apartment : '');
}

export interface IReceiptDetail {
    description: string;
    quantity: string;
    amount: string;
}

class OrderService {
    
    async create(
        paymentId: string, senderName: string, senderPhone: string, recipientName: string, recipientPhone: string, address: string, 
        deliveryMessage: string, deliveryPrice: number, ShopId: number, message: string, methodOfReceipt: TMethodOfReceipt, methodPayment: TMethodPayment
    ) {
        return await Order.create(
            {
                senderName, senderPhone, recipientName, recipientPhone, address, ShopId, paymentId, statusOrder: methodOfReceipt === 'Самовывоз' ? 'Собирается' : 'pending', 
                deliveryMessage, deliveryPrice, statusPayment: 'Не оплачен', message, methodOfReceipt, methodPayment
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }

    async validationTime(shopId: number): Promise<boolean> {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
    
        const shop = await shopService.getById(shopId)
        if(!shop) throw DatabaseError.NotFound(`Магазин с id=${shopId} не найден`) 
        const allTime: TAllTime = '24 часа';
        if(shop.openingHours === allTime){
            return true
        }

        // Разбираем время работы магазина
        const parseTime = (timeStr: string) => {
            const [hoursStr, minutesStr] = timeStr.split(':');
            return {
                hours: parseInt(hoursStr, 10),
                minutes: parseInt(minutesStr, 10),
            };
        };

        const [openingTime, closingTime] = shop.openingHours.split(' - ')
    
        const openTime = parseTime(openingTime);
        const closeTime = parseTime(closingTime);
    
        // Текущее время в минутах для удобства сравнения
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        const openTotalMinutes = openTime.hours * 60 + openTime.minutes;
        const closeTotalMinutes = closeTime.hours * 60 + closeTime.minutes;
    
        // Проверяем, что текущее время внутри интервала [openTime, closeTime]
        return (
            (currentTotalMinutes >= openTotalMinutes) && (currentTotalMinutes <= closeTotalMinutes)
        );
    }

    async createOrder(order: IOrderReq): Promise<string> {
        const methodPayment = order.methodPayment === 'Банковской картой' ? 'bank_card' : 'bank_card'; // метод оплаты ЮКасса
        const validationOpeningHours = await this.validationTime(order.shopId)
        if(!validationOpeningHours) throw RequestError.BadRequest('Магазин закрыт или не может оформить заказ')
        if(order.methodOfReceipt === 'Доставка') {
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
            const deliveryPrice = minPrice;
            const orderData = await this.create('', order.senderName, order.senderPhone, order.recipientName, order.recipientPhone, 
                getAddressFormat(order.address), order.address.message, minPrice, order.shopId, order.message, order.methodOfReceipt, order.methodPayment)
            const {productsPrice, receiptDetail} = await this.productsCreate(order.products, order.shopId, orderData.id)

            let url = `${process.env.CLIENT_URL}/catalog`
            if(order.methodPayment !== 'При получении'){
                receiptDetail.push({
                    description: 'Доставка',
                    quantity: "1",
                    amount: String(deliveryPrice),
                })
                const data = await paymentService.create(`${productsPrice + deliveryPrice}`, `Оплата заказа №${orderData.id}`, methodPayment, receiptDetail, order.senderPhone)
                await Order.update({paymentId: data.id}, {where: {id: orderData.id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
                url = data.urlRedirect;
            }

            return url 
        }
        else {
            const orderData = await this.create('', order.senderName, order.senderPhone, order.recipientName, order.recipientPhone, '', order.address.message, 0, order.shopId, order.message, order.methodOfReceipt,  order.methodPayment)
            const {productsPrice, receiptDetail} = await this.productsCreate(order.products, order.shopId, orderData.id)
            
            let url = `${process.env.CLIENT_URL}/catalog`
            if(order.methodPayment !== 'При получении'){
                const data = await paymentService.create(`${productsPrice}`, `Оплата заказа №${orderData.id}`, methodPayment, receiptDetail, order.senderPhone)
                await Order.update({paymentId: data.id}, {where: {id: orderData.id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
                url = data.urlRedirect;
            }

            return url
        }
    }


    async productsCreate(products: IOrderReq['products'], shopId: number, orderId: number): Promise<{productsPrice: number, receiptDetail: IReceiptDetail[]}> {
        let productsPrice = 0;
        const receiptDetail: IReceiptDetail[] = []
        await Promise.all(products.map(async product => {
            const productData = await productService.getById(product.id)
            if(!productData) throw DatabaseError.NotFound(`Продукт с id=${product.id} не найден`)
            receiptDetail.push({
                description: productData.name,
                quantity: String(product.count),
                amount: String(product.count * productData.price)
            })
            const {id: shopProductId, count: productCountInShop} = await shopProductService.countProduct(shopId, product.id)
            if(productCountInShop < product.count){
                throw RequestError.BadRequest(`В магазине всего ${productCountInShop} единиц товара. Вы хотите купить ${product.count} единиц товара`)
            }
            productsPrice += productData.price * product.count;
            await detailService.create(orderId, productData.id, productData.price, product.count)
            await shopProductService.update(shopProductId, shopId, productCountInShop - product.count)
        }))
        return {productsPrice, receiptDetail};
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
            const date: Date = orderData.createdAt
            const dateFormat = date.toLocaleString('ru', {
                // minute: 'numeric',
                // hour: 'numeric',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            const res: IOrderItem = {
                id: orderData.id,
                date: dateFormat,
                fullPrice: fullPrice + (orderData.deliveryPrice || 0),
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

    async getAllByStatus(statusOrder: TStatus){
        return await Order.findAll({where: {statusOrder}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }

    async returnCountShopProduct(orderId: number, shopId: number) {
        const details = await detailService.get(orderId)
        await Promise.all(details.map(async detail => {
            const {id: shopProductId, count: productCountInShop} = await shopProductService.countProduct(shopId, detail.ProductId)
            await shopProductService.update(shopProductId, shopId, productCountInShop + detail.count)
        }))
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
                        [Op.notIn]: orderActive
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit,
                offset,
            }
                :
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.in]: orderCompleted
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit,
                offset,
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const ordersRes: IOrderItem[] = await this.getFullData(ordersData)
        return ordersRes
    }
    

    async getUser(phone: string, active: boolean, page: number, limit: number) { 
        const offset = (page - 1) * limit; 
        const ordersData = await Order.findAll(
            active
                ?
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.notIn]: orderActive
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit,
                offset
            }
                :
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.in]: orderCompleted
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit,
                offset
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
                        [Op.notIn]: orderActive
                    }
                }
            }
                :
            {
                where: {
                    ShopId,
                    statusOrder: {
                        [Op.in]: orderCompleted
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
                        [Op.notIn]: orderActive
                    }
                }
            }
                :
            {
                where: {
                    senderPhone: phone,
                    statusOrder: {
                        [Op.in]: orderCompleted
                    }
                }
            }
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return count
    }

    async updateStatus(id: number, status: TStatus){
        return await Order.update({statusOrder: status}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async updatePaymentStatus(orderId: number, status: TStatusPayment){
        return await Order.update({statusPayment: status}, {where: {id: orderId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }

    async getByPaymentId(paymentId: string) {
        return await Order.findOne({where: {paymentId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }

    async get(id: number){
        return await Order.findOne({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})  
    }

    async delete(id: number){
        return await Order.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})   
    }
}

export const orderService = new OrderService()