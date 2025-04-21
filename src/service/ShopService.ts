import { Op, QueryTypes } from "sequelize"
import { DatabaseError } from "../error/DatabaseError"
import { IShop, Shop, TAllTime } from "../models"
import slugify from "slugify"
import { TResFilter } from "./CategoryService"


class ShopService {

    validationOpeningHours(openingHours: string | TAllTime): boolean {
        const allTime: TAllTime = '24 часа'
        if (openingHours === allTime) {
            return true;
        }
        const [opening, closing] = openingHours.split(' - ')
        const isValidOpening = shopService.validationTime(opening)
        const isValidClosing = shopService.validationTime(closing)
        return isValidOpening && isValidClosing
    }

    validationTime(time: string){
        const timeRegex = /^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
        return timeRegex.test(time);
    }

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

    async getAllByCategory(slug: string){
        type TRes = {name: string, slug: string, productCount: number}[]
        const sqlQuery = `
            SELECT 
                s.title AS name,
                s."titleSlug" AS slug,
                COUNT(DISTINCT sp."ProductId") AS "productCount"
            FROM public.shop s
            JOIN public."shopProduct" sp ON s.id = sp."ShopId"
            JOIN public.product p ON sp."ProductId" = p.id
            JOIN public."productCategory" pc ON p.id = pc."ProductId" 
            JOIN public.category cat ON pc."CategoryId" = cat.id
            WHERE cat.slug = '${slug}'
            GROUP BY s.id
        `
        const data: any = await Shop.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        if(!data) throw DatabaseError.NotFound(`Не найдена категория с slug=${slug}`)
        const characteristicData: TRes = data;
        const characteristicNames: TResFilter = {
            characteristicName: 'Магазины',
            characteristicSlug: 'shop',
            values: characteristicData.map(data => ({
                name: data.name,
                slug: data.slug,
                count: data.productCount
            }))  
        }
        return characteristicNames
    }

    async getStartsWith(StartsWith: string){
        const shops = await Shop.findAll({
            attributes: ['title', 'titleSlug'],
            where: {
                title: {[Op.iLike]: StartsWith + '%'}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return shops.map(shop => ({title: shop.title, slug: shop.titleSlug}))
    }
}

export const shopService = new ShopService()