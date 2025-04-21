import { IComposition } from "../composition/types";
import { IProductCharacteristicValue } from "../productCharacteristic/types";
import { IShopProduct } from "../shopProduct/types";

export interface IProduct {
    id?: number;
    name: string;
    slug: string;
    images: string[];
    description: string;
    price: number;
}

export interface IProductReq {
    data: {
        id?: string;
        name: string,
        images: string[],
        price: string;
    },
    categories: {id?: number, name: string}[];
    composition: IComposition[],
    characteristics: IProductCharacteristicValue[]
    shops: IShopProduct[] 
}

export interface IProductCard {
    id: number;
    name: string;
    characteristics: IProductCharacteristicValue[],
    composition: IComposition[],

}

export interface IFilters {
    characteristics: {
        characteristicName: string;
        values: string[]
    }[]
    flower: string[];
    page: number;
    sort: string;
    shop: string[]
    price_max: number;
    price_min: number;
}