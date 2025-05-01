export interface IBasket {
    id?: number;
    count: number;
    MyUserId: number;
    ProductId: number;
}

export interface IBasketProducts {
    UserId: number;
    products: {
        ProductId: number;
        count: number;
    }[]
}

export interface IBasketItem{
    name: string,
    image: string;
    price: number,
}