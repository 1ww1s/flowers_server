import { DatabaseError } from "../error/DatabaseError"
import { Characteristic, CharacteristicValue, IProductCharacteristicValue, Product, ProductCharacteristicValue } from "../models"
import { characteristicService } from "./CharacteristicService"
import { characteristicValueService } from "./CharacteristicValueService"

interface IPresent {
    [key: string]: boolean
}

type TResProductCharacteristicFull = {name: string, values: {id: string, value: string}[]}[]

class ProductCharacteristicService {
    
    async create(ProductId: number, CharacteristicValueId: number){
        return await ProductCharacteristicValue.create(
            {ProductId, CharacteristicValueId}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: string, CharacteristicValueId: number){
        return await ProductCharacteristicValue.update(
            {CharacteristicValueId}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)}) 
    }

    async delete(id: number){
        console.log('DELETE', id)
        return await ProductCharacteristicValue.destroy(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)}) 
    }

    async updateAll(ProductId: number, characteristics: IProductCharacteristicValue[]){
        const oldProductCharacteristic = await this.getFull(ProductId)
        .catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const isPresent: IPresent = {}
        await Promise.all(characteristics.map(async characteristic => {
            await Promise.all(characteristic.values.map(async data => {
                console.log(111111, data.id, data.value)
                if(data.id){
                    isPresent[data.id] = true;
                    const oldData = oldProductCharacteristic.find(oldC => oldC.name === characteristic.name)
                    if(!oldData) throw DatabaseError.NotFound(`Характеристика с name = ${characteristic.name} не найдена в прошлой версии`)
                    const oldC = oldData.values.find(oldC => oldC.id === data.id)
                    if(!oldC) throw DatabaseError.NotFound(`Значение характеристики с id = ${data.id} не найдено`)

                    if(oldC.value !== data.value){
                        const CharacteristicValueData = await characteristicValueService.getByValueOrCreate(characteristic.name, data.value)
                        await this.update(data.id, CharacteristicValueData.id)
                    }
                }
                else {
                    const CharacteristicValueData = await characteristicValueService.getByValueOrCreate(characteristic.name, data.value)
                    await this.create(ProductId, CharacteristicValueData.id)
                }
            }))
        }))
        await Promise.all(oldProductCharacteristic.map(async oldC => {
            await Promise.all(oldC.values.map(async data => {
                if(Boolean(data.id) && !isPresent[data.id]){
                    await this.delete(+data.id)
                }
            }))
        }))
    }

    async getByProduct(ProductId: number) {
        return await ProductCharacteristicValue.findAll(
            {where: {ProductId}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getFull(ProductId: number): Promise<TResProductCharacteristicFull> { 
        type TRes = (Characteristic & {CharacteristicValues: (CharacteristicValue & {Products: (Product & {ProductCharacteristicValue: ProductCharacteristicValue})[]})[]}   )[]
        const dataRes: any = await Characteristic.findAll({
            attributes: ['name'],
            include: [
                {
                    model: CharacteristicValue,
                    required: true,
                    include: [
                        {
                            model: Product,
                            required: true,
                            where: {
                                id: ProductId
                            }
                        }
                        
                    ]
                },
               
            ]
        }).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const productCharacteristicValuesData: TRes = dataRes;
        const productCharacteristicValues: TResProductCharacteristicFull = productCharacteristicValuesData.map(pch => ({
            name: pch.name,
            values: pch.CharacteristicValues.map(ch => {
                return {        
                id: `${ch.value, ch.Products[0].ProductCharacteristicValue.id}`, value: ch.value
            }
            })
        }))
        return productCharacteristicValues
    }
}

export const productCharacteristicService = new ProductCharacteristicService()