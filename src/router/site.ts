import {Router} from 'express'
import { siteController } from '../controllers/SiteController'
import { AuthMiddleware } from '../middleware/AuthMiddleware'

const siteRouter = Router()

siteRouter.get('/flowers', siteController.flowersGetAll)
siteRouter.post('/flower/get', siteController.flowerGet) 

siteRouter.get('/shops', siteController.shopsGetAll)
siteRouter.get('/shops/category/:slug', siteController.shopsByCategory)
siteRouter.get('/shop/:slug', siteController.shopGet)


siteRouter.get('/filter/:slug', siteController.getFilter)
siteRouter.get('/flowers/:slug', siteController.getFilterFlowers)
siteRouter.get('/prices/:slug', siteController.getPrices)

siteRouter.post('/products/:slug', siteController.getProductsByCategory)
siteRouter.get('/product/:category/:slug', siteController.getProduct)


siteRouter.get('/product/:slug', siteController.getProduct)
siteRouter.post('/product/shop/getAll', siteController.getProductsInTheShop)
siteRouter.get('/productCard/:slug', siteController.getProductCard)
siteRouter.get('/productPrice/:slug', siteController.getProductPrice)
siteRouter.get('/productShops/:slug', siteController.getProductShops)
siteRouter.get('/productImages/:slug', siteController.getProductImages)

siteRouter.post('/characteristic/get', siteController.getCharacteristic)

siteRouter.get('/category/getNames', siteController.categoryGetNames)
siteRouter.get('/category/getAll', siteController.categoryGetAll)
siteRouter.get('/banner/getAll', siteController.getBanners)

siteRouter.post('/favourites', siteController.getFavourites)
siteRouter.post('/product/basket', siteController.getBasket)

siteRouter.get('/order/:id', AuthMiddleware, siteController.getOrder)

siteRouter.post('/order/create', siteController.orderCreate)

siteRouter.get('/zones', AuthMiddleware, siteController.getZones)

export {siteRouter}