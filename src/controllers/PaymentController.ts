import { NextFunction, Request, Response } from "express";
import { orderService } from "../service/OrderService";
import { RequestError } from "../error/RequestError";
import { shopProductService } from "../service/ShopProductService";
import { detailService } from "../service/DetailService";

interface IWebhook {
    id: string,
    status: string,
    amount: { value: string, currency: string },
    description: string,
    metadata: { orderId: string } // Доп. данные
}

class PaymentController {

    async webhook(req: Request<never, never, {event: string, object: IWebhook}>, res: Response, next: NextFunction){
        try{

            // console.log(44444444444444444, req.body)

            const { event, object } = req.body;

            const paymentId = object.id;

            const orderData = await orderService.getByPaymentId(paymentId)
            if(!orderData) throw RequestError.BadRequest(`Заказ с paymentId=${paymentId} не найден`)

            if (event === 'payment.succeeded') {
                await orderService.updatePaymentStatus(orderData.id, 'Оплачен')
                await orderService.updateStatus(orderData.id, 'Собирается')
            } else if (event === "payment.canceled") {
                const details = await detailService.get(orderData.id)
                await Promise.all(details.map(async detail => {
                    const {id: shopProductId, count: productCountInShop} = await shopProductService.countProduct(orderData.ShopId, detail.ProductId)
                    await shopProductService.update(shopProductId, orderData.ShopId, productCountInShop + detail.count)
                }))
                await orderService.delete(orderData.id)
            }
          
            res.sendStatus(200); // Важно! ЮKassa ждёт ответ 200 OK
        }
        catch(e){
            next(e)
        }
    }
}

export const paymentController = new PaymentController()