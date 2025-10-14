import slugify from "slugify";
import { DatabaseError } from "../error/DatabaseError";
import { RequestError } from "../error/RequestError";
import { IComposition, IFilters, IProduct, IProductReq, Product, ProductCategory } from "../models";
import { characteristicValueService } from "./CharacteristicValueService";
import { compositionService } from "./CompositionService";
import { productCharacteristicService } from "./ProductCharacteristicService";
// import { shopProductService } from "./ShopProductService";
import { itemService } from "./ItemService";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { categoryService } from "./CategoryService";
import { productCheck } from "../check/ProductCheck";
import { productCategoryService } from "./ProductCategoryService";
import { shopProductService } from "./ShopProductService";

class ProductService {

    async create(name: string, price: number, images: string[], description: string){
        const slug = slugify(name.toLowerCase())
        return await Product.create(
            {name, slug, price, description, images}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, name: string, price: number, images: string[], description: string){
        const slug = slugify(name.toLowerCase())
        return await Product.update(
            {name, slug, price, images, description}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async delete(id: number){
        return await Product.destroy(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }
    
    async getById(id: number){
        return await Product.findOne(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async createAll(product: IProductReq['data'], categories: IProductReq['categories'], composition: IComposition[], characteristics: IProductReq['characteristics'], shops: IProductReq['shops']){

        productCheck.full(product, categories, composition, characteristics, shops)  // МБ

        const categoriesIds = await Promise.all(categories.map(async category => {
            const categoryData = await categoryService.getByName(category.name)
            if(!categoryData) throw DatabaseError.NotFound(`Категория с name=${category.name} не найдена`)
            return categoryData.id
        }))

        const productData = await this.create(product.name, +product.price, product.images, "")
        await productCategoryService.createAll(productData.id, categoriesIds)

        await shopProductService.updateAll(productData.id, shops)

        await Promise.all(composition.map(async c => {
            const itemData = await itemService.getByName(c.name)
            if(!itemData) throw DatabaseError.NotFound('Item не найден')
            await compositionService.create(productData.id, itemData.id, +c.count)
        }))
        await Promise.all(characteristics.map(async pc => {
            await Promise.all(pc.values.map(async data => {
                if(data.value){
                    const characteristicValueData = await characteristicValueService.getByValueOrCreate(pc.name, data.value)
                    await productCharacteristicService.create(productData.id, characteristicValueData.id)
                }
                else{
                    throw RequestError.BadRequest('Пустой ProductCharacteristicValue')
                }
            }))
        }))
    }
    

    async updateAll(product: IProductReq['data'], categories: IProductReq['categories'], composition: IProductReq['composition'], characteristics: IProductReq['characteristics'], shops: IProductReq['shops']) {
        if(!product.id) throw RequestError.BadRequest('нет id продукта')

        productCheck.full(product, categories, composition, characteristics, shops)
    
        await this.update(+product.id, product.name, +product.price, product.images, "")
        await productCategoryService.updateAll(categories, +product.id)

        await shopProductService.updateAll(+product.id, shops)
        
        await compositionService.updateAll(+product.id, composition)
        await productCharacteristicService.updateAll(+product.id, characteristics)
    }

    async getByCategory(CategoryId: number){
        return await Product.findAll(
            {include: [
                {
                    model: ProductCategory,
                    where: {CategoryId}
                }
            ]}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getBySlug(slug: string){
        return await Product.findOne(
            {where: {slug}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getBySlugAndCheck(slug: string){
        const productData = await this.getBySlug(slug)
        if(!productData) throw DatabaseError.NotFound('Продукт не найден')
        return productData
    }

    async getAllInTheShop(slug: string){
        const productData = await this.getBySlug(slug)
        if(!productData) throw DatabaseError.NotFound('Продукт не найден')
        return productData
    }

    async getProductsByCategotyAndFilters(
        limit: number = 4, categorySlug: string, filters: IFilters
    ): Promise<{products: IProduct[], totalPages: number}> {
        // console.log(filters.map(filter => (`AND ch1.name = ${filter.characteristic} AND cv1.value IN (${filter.values.map(v => (`"${v}"`))}) \n`))
        console.log(filters)
        const offset = (filters.page - 1) * limit;
        let filtersSQL = ""
        let ind = 1;
        if(filters.characteristics){
            for (let filter of filters.characteristics){
                if(filter.values.length){
                    filtersSQL += `
                        INNER JOIN public."productCharacteristic" pcv${ind} ON pcv${ind}."ProductId" = p.id \n
                        INNER JOIN public."characteristicValue" cv${ind} ON cv${ind}.id = pcv${ind}."CharacteristicValueId"
                        INNER JOIN Characteristic ch${ind} ON ch${ind}.id = cv${ind}."CharacteristicId" 
                        AND ch${ind}.slug = '${filter.characteristicName}' AND cv${ind}.slug IN (${filter.values.map(v => `'${v}'`)})
                    `
                    ind++;
                }
            }
        }
    
        let sortClause = ''; // По умолчанию сортировки нет
        if (filters.sort === 'price_asc') {
          sortClause = 'ORDER BY p.price ASC';
        } else if (filters.sort === 'price_desc') {
          sortClause = 'ORDER BY p.price DESC';
        }

        let priceFilter = ''; // По умолчанию фильтра отсутствует
        if (filters.price_min && filters.price_max) {
            priceFilter = `AND p.price BETWEEN ${filters.price_min} AND ${filters.price_max}`;
        }

        const sqlQuery = `
        WITH TotalRecords AS (
            SELECT COUNT(DISTINCT p.id) AS total_records
            FROM Product p
            INNER JOIN public."productCategory" pc ON pc."ProductId" = p.id
            INNER JOIN Category c ON c.id = pc."CategoryId"
            ${
                filters.flower.length > 0 
                    ? 
                `INNER JOIN public.composition comp ON p.id = comp."ProductId"
                INNER JOIN public.item i ON comp."ItemId" = i.id` 
                    :
                ''
            }
            ${
                filters.shop.length > 0 
                    ? 
                `INNER JOIN public."shopProduct" sp ON p.id = sp."ProductId"
                INNER JOIN public.shop s ON sp."ShopId" = s.id` 
                    :
                ''
            }
            ${filtersSQL}
            WHERE c.slug = '${categorySlug}'
            ${filters.flower.length > 0 ? `AND i.slug IN (${filters.flower.map(f => (`'${f}'`))})` : ''}
            ${filters.shop.length > 0 ? `AND s."titleSlug" IN (${filters.shop.map(s => (`'${s}'`))})` : ''}
            ${priceFilter} 
        )
            SELECT DISTINCT p.id, p.name, p.slug, p.price, p.images[1] as image, tr.total_records
            FROM Product p
            INNER JOIN public."productCategory" pc ON pc."ProductId" = p.id
            INNER JOIN Category c ON c.id = pc."CategoryId"
            ${filtersSQL}
            ${
                filters.flower.length > 0 
                    ? 
                `INNER JOIN public.composition comp ON p.id = comp."ProductId"
                INNER JOIN public.item i ON comp."ItemId" = i.id` 
                    :
                ''
            }
            ${
                filters.shop.length > 0 
                    ? 
                `INNER JOIN public."shopProduct" sp ON p.id = sp."ProductId"
                INNER JOIN public.shop s ON sp."ShopId" = s.id` 
                    :
                ''
            }
            CROSS JOIN TotalRecords tr
            WHERE c.slug = '${categorySlug}'
            ${filters.flower.length > 0 ? `AND i.slug IN (${filters.flower.map(f => (`'${f}'`))})` : ''}
            ${filters.shop.length > 0 ? `AND s."titleSlug" IN (${filters.shop.map(s => (`'${s}'`))})` : ''}
            ${priceFilter} 
            ${sortClause} 
            LIMIT ${limit}
            OFFSET ${offset};
        `
        const data: any = await Product.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        const products: (IProduct & {total_records: number})[] | undefined = data;
        if(!products) throw DatabaseError.Conflict('Неправильный запрос на получение всех продуктов по фильтрам и категории')
        const totalPages = Math.ceil((products[0]?.total_records / limit))
        return {products, totalPages}
    }

    async getStartsWith(StartsWith: string){
        const products = await Product.findAll({
            attributes: ['name', 'slug'],
            where: {
                name: {[Op.iLike]: StartsWith + '%'}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return products.map(product => ({name: product.name, slug: product.slug}))
    }

    async getPrev(id: number){
        const sqlQuery = `
            SELECT p.id, p.name, p.slug, p.price, p.images[1] as image
            FROM Product p
            WHERE p.id = '${id}'
        `
        const data: any = await Product.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        const products: ({id: number, name: string, slug: string, price: number, image: string})[] | undefined = data;
        if(!products) throw DatabaseError.Conflict('Неправильный запрос на получение продукта по id')
        if(products.length === 0) return null
        return {...products[0], id: `${products[0].id}`, price: `${products[0].price}`}
    }

    async getImage(id: number){
        const sqlQuery = `
            SELECT p.images[1] as image
            FROM Product p
            WHERE p.id = '${id}'
        `
        const data: any = await Product.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        const products: ({image: string})[] | undefined = data;
        if(!products) throw DatabaseError.Conflict('Неправильный запрос на получение продукта по id')
        if(products.length === 0) return null
        return products[0]
    }

    async getPreview(slug: string){
        const product = await Product.findOne({
            where: {slug}
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        if(!product) throw DatabaseError.NotFound(`Продукт с slug=${slug} не найден`)
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            price: product.price,
        }
    }

    async getItem(id: number) {
        const sqlQuery = `
            SELECT 
                p.id, 
                p.name, 
                p.slug,
                p.price, 
                p.images[1] AS image,
                c.slug AS "categorySlug"
            FROM 
                Product p
            LEFT JOIN 
                public."productCategory" pc ON p.id = pc."ProductId"
            LEFT JOIN 
                Category c ON pc."CategoryId" = c.id
            WHERE 
                p.id = ${id}
            LIMIT 1;
        `
        const data: any = await Product.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        const products: ({id: number, name: string, slug: string, price: number, image: string, categorySlug: string})[] | undefined = data;
        if(!products) throw DatabaseError.Conflict('Неправильный запрос на получение продукта по id')
        if(products.length === 0) return null
        return products[0]
    }
}

export const productService = new ProductService()