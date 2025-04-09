import { Op } from "sequelize"
import { DatabaseError } from "../error/DatabaseError"
import { IShop, Shop } from "../models"
import slugify from "slugify"


class ShopService {

    async create(title: string, address: string, openingHours: string, x: number, y: number){
        const titleSlug = slugify(title.toLowerCase())
        return await Shop.create({title, titleSlug, address, openingHours, coordinateX: x, coordinateY: y}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, title: string, address: string, openingHours: string, x: number, y: number){
        const titleSlug = slugify(title.toLowerCase())
        return await Shop.update({title, titleSlug, address, openingHours, coordinateX: x, coordinateY: y}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await Shop.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getById(id: number){
        return await Shop.findOne({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByAddress(address: string){
        return await Shop.findOne({where: {address}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByTitle(title: string){
        const shop = await Shop.findOne({where: {title}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!shop) throw DatabaseError.NotFound(`Нет магазина с названием "${title}"`)
        return shop
    }

    async getBySlug(titleSlug: string){
        const shop = await Shop.findOne({where: {titleSlug}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!shop) throw DatabaseError.NotFound(`Нет магазина с названием "${titleSlug}"`)
        return shop
    }

    async getOptions(){
        const shopsData = await Shop.findAll()
        return shopsData.map(shop => (
            {
                id: shop.id, 
                title: shop.title, 
            }
        ))
    }

    async getAll(){
        const shopsData = await Shop.findAll()
        return shopsData.map(shop => (
            {
                id: shop.id, 
                title: shop.title, 
                titleSlug: shop.titleSlug, 
                address: shop.address, 
                openingHours: shop.openingHours, 
                coordinateX: shop.coordinateX, 
                coordinateY: shop.coordinateY
            }
        ))
    }

    async getStartsWith(StartsWith: string){
        const shops = await Shop.findAll({
            where: {
                title: {[Op.startsWith]: StartsWith}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return shops.map(shop => ({title: shop.title, slug: shop.titleSlug}))
    }
}

export const shopService = new ShopService()