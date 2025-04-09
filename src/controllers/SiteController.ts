import { NextFunction, Request, Response } from "express";
import { itemService } from "../service/ItemService";
import { productService } from "../service/ProductService";
import { categoryService } from "../service/CategoryService";
import { compositionService } from "../service/CompositionService";
import { productCharacteristicService } from "../service/ProductCharacteristicService";
import { IBanner, ICategory, IFilters, IProductCard, IProductReq, IShop, IUserDto } from "../models";
import { productCategoryService } from "../service/ProductCategoryService";
import { shopProductService } from "../service/ShopProductService";
import { shopService } from "../service/ShopService";
import { RequestError } from "../error/RequestError";
import { bannerService } from "../service/BannerService";
import { orderService } from "../service/OrderService";
import { AuthError } from "../error/AuthError";
// import { shopProductService } from "../service/ShopProductService";

class SiteController {

    async flowersGetAll(_: Request, res: Response, next: NextFunction){
        try{
            const flowers = await itemService.getAll()
            res.send(flowers)
        }
        catch(e){
            next(e)
        }
    }

    async shopsGetAll(_: Request, res: Response, next: NextFunction){
        try{
            const shops = await shopService.getAll()
            res.send(shops)
        }
        catch(e){
            next(e)
        }
    }
    
    async shopGet(req: Request<{slug: string}>, res: Response, next: NextFunction){
        try{
            const {slug: titleSlug} = req.params;
            if(!titleSlug) throw RequestError.BadRequest('Нет названия магазина')
            const shopData = await shopService.getBySlug(titleSlug)
            const shop: IShop = {
                id: shopData.id,
                title: shopData.title,
                titleSlug: shopData.titleSlug,
                address: shopData.address,
                coordinateX: shopData.coordinateX,
                coordinateY: shopData.coordinateY,
                openingHours: shopData.openingHours
            }
            res.send(shop)
        }
        catch(e){
            next(e)
        }
    }

    async getPrices(req: Request<{slug: string}>, res: Response, next: NextFunction){
        try{
            const {slug} = req.params;
            const prices = await categoryService.getPrices(slug)
            res.send(prices)
        }
        catch(e){
            next(e)
        }
    }

    async getFilter(req: Request<{slug: string}>, res: Response, next: NextFunction){
        try{
            const {slug} = req.params;
            const filter = await categoryService.getFilter(slug)
            res.send(filter)
        }
        catch(e){
            next(e)
        }
    }

    async getProductsByCategory(req: Request<{slug: string}, any, {filters: IFilters}>, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug
            // await new Promise(resolve => setTimeout(resolve, 1000))
            const {filters} = req.body;
            // console.log(filters)
            const {products, totalPages} = await productService.getProductsByCategotyAndFilters(2, slug, filters)
            const response = {
                products: products.map(p => ({...p, id: `${p.id}`, price: `${p.price}`})),
                totalPages
            }
            res.send(response)
        }
        catch(e){
            next(e)
        }
    }

    async getOrder(req: Request<{id: string}, any, {user: IUserDto}>, res: Response, next: NextFunction){
        try{
            const id: string = req.params.id
            const {user} = req.body;
            const order = await orderService.getFull(+id)
            const access = user.roles.includes('admin') // роли, у которых есть доступ к любым заказам
            if(!access && user.phone !== order.senderName){
                throw AuthError.Forbidden(`Нет доступа к этому заказу у пользователя с phone=${user.phone}`)
            }
            res.send(order)
        }
        catch(e){
            next(e)
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug

            const productData = await productService.getBySlugAndCheck(slug)
            const productCategoriesData = await productCategoryService.getAll(productData.id)
            const categoriesData = await categoryService.getAllByIds(productCategoriesData.map(c => c.CategoryId))
            const characteristics = await productCharacteristicService.getFull(productData.id)
            const composition = await compositionService.getAll(productData.id)

            const shops = await shopProductService.getFull(productData.id)

            const product: IProductReq = {
                data: {
                    id: `${productData.id}`,
                    name: productData.name,
                    price: `${productData.price}`,
                    // description: productData.description,
                    images: productData.images,
                },
                categories: categoriesData.map(c => ({id: c.id, name: c.name})),
                composition,
                characteristics,
                shops: shops
            }

            res.send(product)
        }
        catch(e){
            next(e)
        }
    }

    async getProductsInTheShop(req: Request<any, any, {productsId: number[], shopId: number}>, res: Response, next: NextFunction){
        try{
            const {productsId, shopId} = req.body;
            const products = await shopProductService.getInTheShop(productsId, shopId)
            res.send(products)
        }
        catch(e){
            next(e)
        }
    }


    async getProductShops(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug
            const productData = await productService.getBySlugAndCheck(slug)
            const shops = await shopProductService.getFull(productData.id)
            res.send(shops)
        }
        catch(e){
            next(e)
        }
    }

    async getProductCard(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug

            const productData = await productService.getBySlugAndCheck(slug)
            const characteristics = await productCharacteristicService.getFull(productData.id)
            const composition = await compositionService.getAll(productData.id)

            const product: IProductCard = {
                id: productData.id,
                name: productData.name,
                characteristics,
                composition
            }

            res.send(product)
        }
        catch(e){
            next(e)
        }
    }

    async getProductPrice(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug
            const productData = await productService.getBySlugAndCheck(slug)
            res.send({id: productData.id, price: productData.price})
        }
        catch(e){
            next(e)
        }
    }

    async getBasket(req: Request<any, any, {ids: number[]}>, res: Response, next: NextFunction){
        try{
            const {ids} = req.body;
            const items = await Promise.all(ids.map(async id => {
                const item = await productService.getItem(id)
                if(!item) return null
                const countMax = await shopProductService.countProductInShops(id)
                return {...item, countMax}
            }))
            res.send(items)
        }
        catch(e){
            next(e)
        }
    }

    async getBanners(_: Request, res: Response, next: NextFunction){
        try{
            const bannersData = await bannerService.getAll()
            const banners: IBanner[] = bannersData.map(data => ({
                title: data.title,
                sign: data.sign,
                buttonLink: data.buttonLink,
                image: data.image
            }))
            res.send(banners)
        }
        catch(e){
            next(e)
        }
    }

    async getProductImages(req: Request, res: Response, next: NextFunction){
        try{
            const slug: string = req.params.slug
            const productData = await productService.getBySlugAndCheck(slug)
            const images = productData.images;
            res.send(images)
        }
        catch(e){
            next(e)
        }
    }

    async getFavourites(req: Request<any, any, {ids: number[]}>, res: Response, next: NextFunction){
        try{
            const {ids} = req.body;
            const products = await Promise.all(ids.map(async id => {
                return await productService.getPrev(id)
            }))
            res.send(products)
        }
        catch(e){
            next(e)
        }
    }

    async categoryGetNames(_: Request, res: Response, next: NextFunction){
        try{
            const names: {id: number, name: string, slug: string}[] = await categoryService.getNames()
            res.send(names)
        }
        catch(e){
            next(e)
        }
    }

    async categoryGetAll(_: Request, res: Response, next: NextFunction){
        try{
            const categories: ICategory[] = await categoryService.getAll()
            res.send(categories)
        }
        catch(e){
            next(e)
        }
    }
}

export const siteController = new SiteController()