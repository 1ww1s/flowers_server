import express from 'express'
import { adminController } from '../controllers/AdminController'
import { CheckRolesMiddleware } from '../middleware/CheckRolesMiddleware'

const adminRouter = express.Router()

adminRouter.post('/category/create', adminController.categoryCreate)
adminRouter.post('/category/update', adminController.categoryUpdate)
adminRouter.post('/category/getStartsWith', adminController.categoryStartsWith)
adminRouter.post('/category/get', adminController.categoryGet)

adminRouter.post('/categoryCharacteristic/add', adminController.categoryCharacteristicAdd)
adminRouter.post('/categoryCharacteristic/delete', adminController.categoryCharacteristicDelete)

adminRouter.post('/product/create', adminController.productCreate)
adminRouter.post('/product/update', adminController.productUpdate)
adminRouter.post('/product/delete', CheckRolesMiddleware(['admin']), adminController.productDelete)
adminRouter.post('/product/getStartsWith', adminController.productStartsWith)
adminRouter.get('/product/preview/:slug', adminController.getPreview)

adminRouter.post('/characteristic/create', adminController.characteristicCreate)
adminRouter.post('/characteristic/update', adminController.characteristicUpdate)
adminRouter.post('/characteristic/delete',  CheckRolesMiddleware(['admin']), adminController.characteristicDelete)
adminRouter.post('/characteristic/getStartsWith', adminController.characteristicStartsWith)

adminRouter.post('/characteristicValue/create', adminController.characteristicValueCreate)
adminRouter.post('/characteristicValue/update', adminController.characteristicValueUpdate)
adminRouter.post('/characteristicValue/delete', adminController.characteristicValueDelete)
adminRouter.post('/characteristic/getValuesStartsWith', adminController.getCharacteristicsValuesStartsWith)
adminRouter.get('/characteristic/getAll', adminController.getCharacteristics)

adminRouter.post('/item/create', adminController.itemCreate)
adminRouter.post('/item/update', adminController.itemUpdate)
adminRouter.post('/item/delete', adminController.itemDelete)
adminRouter.post('/flower/getStartsWith', adminController.getItemsStartsWith)

adminRouter.post('/role/create', CheckRolesMiddleware(['admin']), adminController.roleCreate)
adminRouter.post('/role/update', CheckRolesMiddleware(['admin']), adminController.roleUpdate)
adminRouter.get('/role/getAll', CheckRolesMiddleware(['admin']), adminController.roleGetAll)


adminRouter.post('/user/get', CheckRolesMiddleware(['admin']), adminController.getUser)
adminRouter.post('/user/getStartsWith', CheckRolesMiddleware(['admin']), adminController.getUserStartsWith)
adminRouter.post('/user/rolesUpdate', CheckRolesMiddleware(['admin']), adminController.userRolesUpdate)

adminRouter.post('/shop/create', adminController.shopCreate)
adminRouter.post('/shop/update', adminController.shopUpdate)
adminRouter.post('/shop/delete',  CheckRolesMiddleware(['admin']), adminController.shopDelete)
// adminRouter.post('/shopProduct', adminController.shopProduct)
adminRouter.post('/shop/getStartsWith', adminController.getShopStartsWith)
adminRouter.get('/shop/getOptions', adminController.getShopOptions)

adminRouter.post('/basket/create', adminController.basketCreate)
adminRouter.post('/basket/delete', adminController.basketDelete)
adminRouter.post('/basket/update', adminController.basketUpdate)

adminRouter.post('/banner/create', adminController.bannerCreate)
adminRouter.post('/banner/update', adminController.bannerUpdate)
adminRouter.post('/banner/delete', adminController.bannerDelete)
adminRouter.post('/banner/getStartsWith', adminController.getBannerStartsWith)
adminRouter.post('/banner/get', adminController.bannerGet)

adminRouter.post('/orderStatus/create', adminController.basketUpdate)

adminRouter.post('/shop/orders', adminController.getOrdersShop)
adminRouter.post('/shop/orders/count', adminController.getOrdersShopCount)

adminRouter.post('/order/status/update', adminController.updateOrderStatus)


adminRouter.post('/user/orders', adminController.getOrdersUser)
adminRouter.post('/user/orders/count', adminController.getOrdersUserCount)

export {adminRouter}