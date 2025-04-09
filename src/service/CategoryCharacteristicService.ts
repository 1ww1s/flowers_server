import { DatabaseError } from "../error/DatabaseError";
import { CategoryCharacteristic, ICategoryCharacteristic } from "../models";



class CategoryCharacteristicService {

    async create(CategoryId: number, CharacteristicId: number){
        return await CategoryCharacteristic.create({CategoryId, CharacteristicId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await CategoryCharacteristic.destroy({where:{id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    
}

export const categoryCharacteristicService = new CategoryCharacteristicService()