import slugify from "slugify";
import { DatabaseError } from "../error/DatabaseError";
import { Category, Characteristic, CharacteristicValue, Item, Product } from "../models";
import { Op, QueryTypes } from "sequelize";

export type TResFilter = {
    characteristicName: string;
    characteristicSlug: string; 
    values: {
        name: string; 
        slug: string;
        count: number
    }[]
};

class CategoryService {

    async create(name: string, image: string){
        const slug = slugify(name.toLowerCase())
        return await Category.create(
            {name, slug, image}
        ).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, name: string, image: string){
        const slug = slugify(name.toLowerCase())
        return await Category.update(
            {name, slug, image}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }    

    async getFlowers(slug: string){
        type TRes = {name: string, slug: string, productCount: number}[]
        const sqlQuery = `
            SELECT 
                i.name,
                i.slug,
                COUNT(DISTINCT p.id) AS "productCount"
            FROM public.item i
            JOIN public.composition c ON i.id = c."ItemId"
            JOIN public.product p ON c."ProductId" = p.id
            JOIN public."productCategory" pc ON p.id = pc."ProductId"  -- связь многие-ко-многим
            JOIN public.category cat ON pc."CategoryId" = cat.id
            WHERE cat.slug = '${slug}'
            GROUP BY i.id
        `
        const data: any = await Item.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        if(!data) throw DatabaseError.NotFound(`Не найдена категория с slug=${slug}`)
        const characteristicData: TRes = data;
        const characteristicNames: TResFilter = {
            characteristicName: 'Цветы',
            characteristicSlug: 'flower',
            values: characteristicData.map(data => ({
                name: data.name,
                slug: data.slug,
                count: data.productCount
            }))  
        }
        return characteristicNames
    }

    async getFilter(slug: string){
        type TRes = (Characteristic & {CharacteristicValues: (CharacteristicValue & {Products: Product[]})[]})[]
        const data: any = await Characteristic.findAll({
            attributes: ['name', 'slug'],
            include: [
                {
                    model: CharacteristicValue,
                    required: true,
                    include: [
                        {
                            model: Product,
                            attributes: ['id'],
                            required: true,
                            include: [{
                                model: Category,
                                required: true,
                                attributes: [],
                                where: {slug}
                            }]
                        }
                    ]
                }
            ],
        }).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const characteristicData: TRes = data;
        const characteristicNames: TResFilter[] = characteristicData.map(cd => ({
            characteristicName: cd.name,
            characteristicSlug: cd.slug, 
            values: cd.CharacteristicValues.map(cv=> ({name: cv.value, slug: cv.slug, count: cv.Products.length}))
        }))
        return characteristicNames
    }

    async getPrices(slug: string){
        const categoryData = await this.getBySlug(slug)
        if(!categoryData) throw DatabaseError.NotFound(`Категория с slug=${slug} не найдена`)
        const sqlQuery = `
            SELECT 
            COALESCE(MIN(p.price), 0) AS min, 
            COALESCE(MAX(p.price), 0) AS max
            FROM Product p
            INNER JOIN public."productCategory" pc ON pc."ProductId" = p.id
            INNER JOIN Category c ON c.id = pc."CategoryId"
            WHERE c.slug = '${slug}';
        `
        const data = await Product.sequelize?.query(
            sqlQuery, {type: QueryTypes.SELECT}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)});
        if(!data) throw DatabaseError.NotFound(`Не найдены min и max для категории с slug=${slug}`)
        const prices = data[0] as {min: number, max: number};
        return prices
    }

    async getBySlug(slug: string){
        return await Category.findOne(
            {where: {slug}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getById(id: number){
        return await Category.findOne(
            {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getByName(name: string){
        return await Category.findOne(
            {where: {name}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getAllByIds(CategoriesIds: number[]){
        const categoriesData = await Promise.all(CategoriesIds.map(async c => {
            const categoryData = await this.getById(c) 
            if(!categoryData) throw DatabaseError.NotFound(`Категория с id=${c} не найдена`)
            return categoryData
        }))
        return categoriesData
    }

    async getNames(){
        const categoryAll = await Category.findAll({attributes: ['id', 'name', 'slug']}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return categoryAll.map(c => ({id: c.id, name: c.name, slug: c.slug}))
    }

    async getAll() {
        const categoryAll = await Category.findAll().catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return categoryAll.map(c => ({name: c.name, slug: c.slug, image: c.image}))
    }

    async getStartsWith(StartsWith: string){
           const categories = await Category.findAll({
            attributes: ['name'],
            where: {
                name: {[Op.iLike]: StartsWith + '%'}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return categories.map(category => (category.name))
    }
}

export const categoryService = new CategoryService()