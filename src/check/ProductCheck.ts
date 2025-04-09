import { RequestError } from "../error/RequestError"
import { IProductReq } from "../models"




class ProductCheck {
    
    full(product: IProductReq['data'], categories: IProductReq['categories'], composition: IProductReq['composition'], characteristics: IProductReq['characteristics'], shops: IProductReq['shops']){
        if(!product.name)
            throw RequestError.BadRequest('Нет имени продукта')
        if(!categories.length)
            throw RequestError.BadRequest('Не указаны категории')
        if(!product.images.length)
            throw RequestError.BadRequest('Нет фотографии продукта')
        if(!product.price)
            throw RequestError.BadRequest('Нет цены продукта')
        if(!shops.length)
            throw RequestError.BadRequest('Не указана информация о наличии в магазинах')
        composition.map(c => {
            if(!c.name || !c.count) 
                throw RequestError.BadRequest('Нет ед. продукта или его кол-ва в составе')
        })
        characteristics.map(c => {
            if(!c.name)
                throw RequestError.BadRequest('Нет имени характеристики')
            c.values.map(v => {
                if(!v.value)
                    throw RequestError.BadRequest(`Пустое значение характеристики`)
            })
        })
    }



}

export const productCheck = new ProductCheck()