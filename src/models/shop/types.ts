export type TAllTime = '24 часа'

export interface IShop {
    id?: number;
    title: string;
    titleSlug: string;
    address: string;
    openingHours: string | TAllTime;
    coordinateX: number;
    coordinateY: number;
}
