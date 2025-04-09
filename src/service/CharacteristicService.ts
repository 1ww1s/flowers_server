import slugify from "slugify"
import { DatabaseError } from "../error/DatabaseError"
import { Characteristic } from "../models"



class CharacteristicService {

    async create(name: string){
        const slug = slugify(name.toLowerCase())
        return await Characteristic.create({name, slug}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async upate(id: number, name: string){
        const slug = slugify(name.toLowerCase())
        return await Characteristic.update(
            {name, slug}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await Characteristic.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async createWithCategory(name: string){
        const characteristicData = await this.create(name)
    }

    async getById(id: number){
        return await Characteristic.findOne(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByName(name: string){
        return await Characteristic.findOne(
            {where: {name}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getAll() {
        return await Characteristic.findAll().catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }
}

export const characteristicService = new CharacteristicService()