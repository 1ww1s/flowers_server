export interface IProductCharacteristicValueDB {
    id?: number;
    ProductId: number;
    CharacteristicValueId: number;
}

export interface IProductCharacteristicValue {
    name: string;
    values: {
        id?: string;
        value: string;
    }[]
}