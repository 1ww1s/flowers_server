import { DatabaseError } from "../error/DatabaseError"
import { Detail } from "../models"


class DetailService {

    async create(OrderId: number, ProductId: number, price: number, count: number){
        return await Detail.create(
            {OrderId, ProductId, price, count}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async get(OrderId: number){
        return await Detail.findAll({where: {OrderId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }
}

export const detailService = new DetailService()