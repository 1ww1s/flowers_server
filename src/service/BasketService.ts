import { DatabaseError } from "../error/DatabaseError"
import { Basket, IBasketProducts, Product } from "../models"


class BasketService {
    async create(ProductId: number, MyUserId: number, count: number){
        const product = await Product.findOne({where: {id: ProductId}})
        if(!product) return ProductId 
        await Basket.create({ProductId, MyUserId, count}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return null
    }

    async delete(id: number){
        return await Basket.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, count: number){
        return await Basket.update({count}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async get(MyUserId: number, ProductId: number){
        return await Basket.findOne(
            {where: {MyUserId, ProductId}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getAllByUser(MyUserId: number){
        const basketData = await Basket.findAll(
            {where: {MyUserId}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return basketData.map( basketItem => ({
            id: basketItem.ProductId,
            count: basketItem.count
        }))
    }

    async updateAll(MyUserId: number, products: IBasketProducts['products']){
        await Promise.all(products.map(async product => {
            const basketItem = await Basket.findOne({where: {MyUserId, ProductId: product.ProductId}})
            if(basketItem && basketItem.count !== product.count){
                await this.update(basketItem?.id, product.count)
            }
            if(!basketItem){
                await this.create(product.ProductId, MyUserId, product.count)
            }
        }))    
    }
}

export const basketService = new BasketService()