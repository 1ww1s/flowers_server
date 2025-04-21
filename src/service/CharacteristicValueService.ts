import slugify from "slugify"
import { DatabaseError } from "../error/DatabaseError"
import { Characteristic, CharacteristicValue } from "../models"
import { characteristicService } from "./CharacteristicService"
import { Op } from "sequelize"
import { RequestError } from "../error/RequestError"


class CharacteristicValueService {
    
    async create(value: string, CharacteristicId: number){
        const slug = slugify(value.toLowerCase())
        return await CharacteristicValue.create(
            {value, slug, CharacteristicId}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, value: string){
        const slug = slugify(value.toLowerCase())
        return await CharacteristicValue.update(
            {value, slug}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await CharacteristicValue.destroy(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async get(value: string){
        return await CharacteristicValue.findOne(
            {where: {value}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getById(id: number){
        return await CharacteristicValue.findOne(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByValue(value: string){
        return await CharacteristicValue.findOne(
            {where: {value}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByValueOrCreate(characteristicName: string, value: string){
        let characteristicValue = await this.get(value)
        if(!characteristicValue){
            const characteristicData = await characteristicService.getByName(characteristicName)
            if(!characteristicData) throw DatabaseError.NotFound('Характеристика не найдена')
            if(!value) throw RequestError.BadRequest('Пустой ProductCharacteristicValue')
            characteristicValue = await this.create(value, characteristicData.id)
        }
        return characteristicValue
    }

    async getCharacteristicsByStartsWith(value: string, characteristicName: string): Promise<string[]> {
        const data = await CharacteristicValue.findAll({
            where: {
                value: {[Op.iLike]: value + '%'}
            },
            attributes: ['value'],
            include: [
                {
                    model: Characteristic,
                    attributes: [],
                    required: true,
                    where: {
                        name: characteristicName
                    }
                }
            ]
        })
        return data.map(characteristic => characteristic.value)
    }
}

export const characteristicValueService = new CharacteristicValueService()