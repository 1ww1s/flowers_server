import Payment from "payment"
import { v4 as uuidv4 } from 'uuid';
import { IReceiptDetail, orderService } from "./OrderService";
import { IOrder } from "../models";
import { RequestError } from "../error/RequestError";

const YOOKASSA_SHOP_ID = '1067746'; // Замените на ваш shopId
const YOOKASSA_SECRET_KEY = 'test_UW3z8vWshBD63LLrrOiHY96uYajTPXqDu83Cect73sY'; // Замените на ваш секретный ключ
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments';


type TPaymentMethod = "bank_card"

interface IPaymentUKassa {
    id: string;
    confirmation: {
        confirmation_url: string
    }
}

interface IPaymentData {
    id: string,
    status: string,
    amount: { value: string, currency: string },
    description: string,
    refundable: boolean;
}

interface RefundRequest {
    payment_id: string;
    amount: {
      value: string;
      currency: string;
    };
    description?: string;
}  

interface RefundResult {
    id: string;
    status: 'succeeded' | 'canceled' | 'pending' | 'failed';
    amount: { value: string; currency: string };
    payment_id: string;
    created_at: string;
    cancellation_details?: {
      reason: 'expired_on_confirmation' | 'merchant_canceled' | 'rejected';
      party: 'yoo_kassa' | 'merchant' | 'payment_network';
    };
    error?: {
      code: string;
      description: string;
    };
  }

class PaymentService {
    
    async create(amount: string, description: string, paymentMethod: TPaymentMethod, details: IReceiptDetail[], phone: string){
        
        const paymentData = {
            amount: {
                value: amount,
                currency: 'RUB',
            },
            payment_method_data: {
                type: paymentMethod,
            },
            confirmation: {
                type: 'redirect',
                return_url: `${process.env.CLIENT_URL}/catalog`, // URL после оплаты
            },
            capture: true,
            description: description || `Оплата заказа ${uuidv4()}`,
            receipt: { 
                customer: {
                    "phone": `+${phone}`,
                },
                items: details.map(detail => ({
                    description: detail.description,
                    quantity: detail.quantity,
                    amount: { value: detail.amount, currency: "RUB" },
                    vat_code: "1", // Ставка НДС
                }))
            },
        };
        
        const response = await fetch(YOOKASSA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`,
                'Idempotence-Key': uuidv4(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: IPaymentUKassa = await response.json(); 
        
        setTimeout(() => this.checkStatusOrders(data.id), 1000*60*15)
        
        return {
            id: data.id,
            urlRedirect: data.confirmation.confirmation_url
        }     
    }
    
    async checkStatusOrders(paymentId: string){
        const order = await orderService.getByPaymentId(paymentId)
        if(order && order.statusOrder === 'pending'){
            await orderService.returnCountShopProduct(order.id, order.ShopId)
            await orderService.delete(order.id)
        }
    }

    async createFullRefund(paymentId: string): Promise<RefundResult> {
        try {
            // 1. Получаем информацию о платеже
            const paymentData = await this.checkStatusPayment(paymentId);
            
            if(!paymentData.refundable) throw RequestError.BadRequest('Возврат уже происходил')

            // 2. Создаем запрос на возврат
            const refundRequest: RefundRequest = {
                payment_id: paymentId,
                amount: paymentData.amount,
                description: 'Полный возврат средств',
            };
    
            // 3. Отправляем запрос на возврат
            const response = await fetch(`https://api.yookassa.ru/v3/refunds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`,
                    'Idempotence-Key': uuidv4(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(refundRequest),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to create refund: ${response.status} - ${JSON.stringify(errorData)}`);
            }
    
            const data = await response.json() as RefundResult

            return data
        } catch (error) {
            console.error('Error in createFullRefund:', error);
            throw error;
        }
      }
    
    async checkStatusPayment(paymentId: string){
        const response = await fetch(`${YOOKASSA_API_URL}/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`,
                'Idempotence-Key': uuidv4(),
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: IPaymentData = await response.json(); 
        return data
    }

    async receiptCreate(){

    }
    
}

const paymentService = new PaymentService()


export {paymentService}