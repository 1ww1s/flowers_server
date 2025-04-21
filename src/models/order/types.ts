
export type TStatus = "pending" | "Собирается" | "Готов к выдаче" | "Передается курьеру" | "Передан курьеру" | "Выдан" | "Отменен"
export type TMethodPayment = "Банковской картой" | "Системой быстрых платежей" | "При получении"
export type TM = "spb" | "card" | 'upon receipt'
export type TMethodOfReceipt =  "Самовывоз" | "Доставка";
export type TStatusPayment =  "Оплачен" | "Не оплачен"

export interface IOrder {
    id?: number;
    paymentId: string;
    // amount: string;
    senderName: string; // отправитель
    senderPhone: string;
    recipientName : string; // получатель
    recipientPhone : string;
    methodOfReceipt: TMethodOfReceipt;
    statusOrder: TStatus;
    methodPayment: TMethodPayment;
    statusPayment: TStatusPayment;
    address: string;
    deliveryMessage: string;
    deliveryPrice: number;
    message: string;    
    ShopId: number;
}


export interface IOrderRes {
    id: number;
    date: string;
    products: {
        slug: string;
        categorySlug: string;
        image: string;
        count: number;
        price: number;
    }[];
    senderName: string; // отправитель
    senderPhone: string;
    recipientName: string; // получатель
    recipientPhone: string;
    message: string;
    methodOfReceipt: TMethodOfReceipt;
    methodPayment: TMethodPayment;
    address: string;
    deliveryMessage: string;
    deliveryPrice: number;
    shop: {
        title: string;
        address: string;
        openingHours: string;
    }
    statusOrder: string;
    statusPayment: string;
}

export interface IOrderReq {
    products: {
        id: number;
        count: number;
    }[];
    senderName: string;
    senderPhone: string;
    recipientName: string;
    recipientPhone: string;
    message: string;
    methodOfReceipt: TMethodOfReceipt;
    methodPayment: TMethodPayment;
    address: IAddress;
    shopId: number;
}

interface IAddress {
    street: string;
    apartment: string;
    entrance: string;
    floor: string;
    message: string;
}

export interface IOrderItem {
    id: number;
    date: string;
    fullPrice: number;
    statusOrder: string;
    statusPayment: string;
    methodOfReceipt: TMethodOfReceipt;
    methodPayment: TMethodPayment;
    products: {
        image: string;
        count: number;
    }[];
}