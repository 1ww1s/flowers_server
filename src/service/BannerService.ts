

import { Op } from "sequelize"
import { DatabaseError } from "../error/DatabaseError"
import { Banner } from "../models"


class BannerService {
    async create(title: string, sign: string, image: string, buttonLink: string){
        return await Banner.create({title, sign, image, buttonLink}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await Banner.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, title: string, sign: string, image: string, buttonLink: string){
        return await Banner.update({title, sign, image, buttonLink}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByTitle(title: string){
        const banner = await Banner.findOne(
            {where: {title}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!banner) throw DatabaseError.NotFound(`Нет баннера с названием "${title}"`)
        return banner
    }

    async getAll(){
        return await Banner.findAll().catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getStartsWith(StartsWith: string){
        const banners = await Banner.findAll({
         where: {
            title: {[Op.startsWith]: StartsWith}
         }
     }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
     return banners.map(banner => (banner.title))
 }
}

export const bannerService = new BannerService()