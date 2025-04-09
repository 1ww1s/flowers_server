export interface IShopProductDB {
    id?: number;
    count: number;
    ShopId: number;
    ProductId: number;
}

export interface IShopProduct {
    id?: number;
    title: string;
    address: string;
    openingHours?: string;
    count: string;
}
