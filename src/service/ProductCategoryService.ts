import { DatabaseError } from "../error/DatabaseError";
import { ProductCategory } from "../models/productCategory/model";
import { categoryService } from "./CategoryService";


interface IPresent {
    [key: string]: boolean
}


class ProductCategoryService {

    async getAll(ProductId: number){
        return await ProductCategory.findAll(
            {where: {ProductId}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async create(CategoryId: number, ProductId: number){
        return await ProductCategory.create({CategoryId, ProductId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async createAll(ProductId: number, categoriesIds: number[]){
        await Promise.all(categoriesIds.map(async c => {
            await this.create(c, ProductId)
        }))
    }

    async delete(id: number){
        return await ProductCategory.destroy(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async updateAll(categories: {id?: number, name: string}[], ProductId: number){
        const oldProductCategory = await ProductCategory.findAll({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const isPresent: IPresent = {}
        console.log(oldProductCategory)
        await Promise.all(categories.map(async c => {
            console.log(c)
            const oldPC = oldProductCategory.find(oldPC => oldPC.CategoryId === c.id)
            if(oldPC?.id){
                isPresent[oldPC.id] = true;
            }
            else {
                const categoryData = await categoryService.getByName(c.name)
                if(!categoryData) throw DatabaseError.NotFound(`Категория с name=${c.name} не найдена`)
                await this.create(categoryData.id, ProductId)
            }
        }))
        await Promise.all(oldProductCategory.map(async oldPC => {
            if(!isPresent[oldPC.id]){
                await this.delete(oldPC.id)
            }
        }))
    }



}

export const productCategoryService = new ProductCategoryService()