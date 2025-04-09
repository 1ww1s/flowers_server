import { Op } from "sequelize"
import { DatabaseError } from "../error/DatabaseError"
import { Item } from "../models"
import slugify from "slugify"


class ItemService {

    async create(name: string) {
        const slug = slugify(name.toLowerCase())
        return await Item.create({name, slug}).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, name: string){
        const slug = slugify(name.toLowerCase())
        return await Item.update({name, slug}, {where: {id}}).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
    }

    async getAll(){
        const flowersData = await Item.findAll().catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return flowersData.map(flower => ({id: flower.id, name: flower.name}))
    }

    async getStartsWith(StartsWith: string){
        const items = await Item.findAll({
            where: {
                name: {[Op.startsWith]: StartsWith}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return items.map(item => ({id: item.id, name: item.name}))
    }

    async getById(id: number){
        return await Item.findOne({where: {id}}).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByName(name: string){
        return await Item.findOne({where: {name}}).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
    }
}

export const itemService = new ItemService()
