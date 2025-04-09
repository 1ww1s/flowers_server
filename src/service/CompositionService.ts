import { DatabaseError } from "../error/DatabaseError"
import { Composition, IComposition, Item } from "../models"
import { itemService } from "./ItemService"

interface IPresent {
    [key: string]: boolean
}

class CompositionService {

    async create(ProductId: number, ItemId: number, count: number){
        return await Composition.create({count, ProductId, ItemId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, ItemId: number, count: number){
        return await Composition.update({ItemId, count}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await Composition.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async updateAll(ProductId: number, composition: IComposition[]) {
        const oldComposition = await Composition.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const isPresent: IPresent = {}
        await Promise.all(composition.map(async c => {
            if(c.id){
                isPresent[c.id] = true;
                const oldC = (oldComposition.find(oldC =>  String(oldC.id) === c.id))
                if(oldC){
                    const oldItemData = await itemService.getById(oldC.ItemId)
                    if(!oldItemData) throw DatabaseError.NotFound('Item не найден')
                    if(c.name !== oldItemData.name || +c.count !== oldC.count){
                        const newItemData = await itemService.getByName(c.name)
                        if(!newItemData) throw DatabaseError.NotFound('Item не найден')
                        await this.update(+c.id, newItemData.id, +c.count)
                    }
                }
            }
            else {
                const itemData = await itemService.getByName(c.name)
                if(itemData) await this.create(ProductId, itemData.id, +c.count)
            }
        }))
        await Promise.all(oldComposition.map(async oldC => {
            if(!isPresent[oldC.id]){
                await this.delete(oldC.id)
            }
        }))
    }

    async getAll(ProductId: number): Promise<IComposition[]> {
        const compositionData = await Composition.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const composition = await Promise.all(compositionData.map(async c => {
            const itemData = await itemService.getById(c.ItemId)
            if(!itemData) throw DatabaseError.NotFound(`Не найден item с id = ${c.ItemId}`)
            return {
                id: `${c.id}`,
                name: itemData.name,
                count: `${c.count}`,
            }
        }))
        return composition
    }
}

export const compositionService = new CompositionService()