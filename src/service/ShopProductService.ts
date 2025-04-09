import { QueryTypes } from "sequelize";
import { DatabaseError } from "../error/DatabaseError"
import { IShopProduct, ShopProduct } from "../models"
import { shopService } from "./ShopService";

interface IIsPresent {
    [key: string]: boolean;
}

class ShopProductService {

    async create(ProductId: number, ShopId: number, count: number){
        return await ShopProduct.create({ProductId, ShopId, count}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, ShopId: number, count: number){
        return await ShopProduct.update({ShopId, count}, {where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await ShopProduct.destroy({where: {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async countProductInShops(ProductId: number){
        const shops = await ShopProduct.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        let count = 0;
        for(let shop of shops){
            count += shop.count;
        }
        return count
    }

    async countProduct(ShopId: number, ProductId: number){
        const shopProductData = await ShopProduct.findOne({where: {ShopId, ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!shopProductData) throw DatabaseError.NotFound(`Не найдена информация с productId=${ProductId} и shopId=${ShopId}`)
        return shopProductData.count
    }



    async updateAll(ProductId: number, shops: IShopProduct[]){
        const shopProductOld = await ShopProduct.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const isPresent: IIsPresent = {}
        await Promise.all(shops.map(async shop => {
            const shopDataNew = await shopService.getByTitle(shop.title)
            if(!shopDataNew) throw DatabaseError.NotFound(`Магазин с названием "${shop.title}" не найден`)
            if(shop.id){
                isPresent[shop.id] = true;
                const oldShop = shopProductOld.find(oldShop => oldShop.id === shop.id)
                if(!oldShop) throw DatabaseError.NotFound(`Данный id не найден в старой версии`)
                const shopDataOld = await shopService.getById(oldShop.ShopId)
                if(!shopDataOld) throw DatabaseError.NotFound(`Магазин с id "${shop.id}" не найден`)
                if(oldShop.count !== +shop.count || shopDataOld.title !== shop.title){
                    await this.update(shop.id, shopDataNew.id, +shop.count)
                }
            }
            else{
                await this.create(ProductId, shopDataNew.id, +shop.count)
            }
        }))
        await Promise.all(shopProductOld.map(async shOld => {
            if(!isPresent[shOld.id]){
                await this.delete(shOld.id)
            }     
        }))
    }

    async getFull(ProductId: number): Promise<IShopProduct[]> {
        const shopsProductData = await ShopProduct.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const shops = await Promise.all(shopsProductData.map(async shopProduct => {
            const shopData = await shopService.getById(shopProduct.ShopId)
            if(!shopData) throw DatabaseError.NotFound(`Магазин с id = ${shopProduct.ShopId} не найден`)
            return {
                id: shopProduct.id,
                title: shopData.title,
                address: shopData.address,
                openingHours: shopData.openingHours,
                count: `${shopProduct.count}`,
            }
        }))
        return shops
    }

    async getInTheShop(productsId: number[], shopId: number): Promise<{productId: number, image: string, productCountMax: number}[]> {
        console.log('AAAAAAAAAAAAA', productsId)
        const sqlQuery = `
            SELECT 
                p.id AS "productId",
                p.price,
                p.images[1] AS image,
                COALESCE(sp.count, 0) AS "productCountMax"
            FROM
                Product p
            LEFT JOIN
                public."shopProduct" sp ON p.id = sp."ProductId" AND sp."ShopId" = ${shopId}
            WHERE
                p.id IN (${productsId.join(', ')});
        `;
        const data: any = await ShopProduct.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        const products: ({productId: number, image: string, price: number, productCountMax: number})[] | undefined = data;
        if(!products) throw DatabaseError.Conflict('Неправильный запрос на получение продукта по id')
        return products
    }
}

export const shopProductService = new ShopProductService()