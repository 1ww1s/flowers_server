import {Sequelize} from 'sequelize-typescript'
import { Product } from './product/model';
import { Composition } from './composition/model';
import { Item } from './item/model';
import { Category } from './category/model';
import { Basket } from './basket/model';
import { User } from './user/model';
import { RefreshToken } from './refreshToken/model';
import { Role } from './role/model';
import { UserRole } from './userRole/model';
import { ShopProduct } from './shopProduct/model';
import { Order } from './order/model';
import { Detail } from './detail/model';
import { Characteristic } from './characteristic/model';
import { ProductCharacteristicValue } from './productCharacteristic/model';
import { Shop } from './shop/model';
import { CharacteristicValue } from './characteristicValue/model';
import { CategoryCharacteristic } from './categoryCharacteristic/model';
import { ProductCategory } from './productCategory/model';
import { Banner } from './banner/model';
// import { ShopCount } from './shopCount/model';



export const connection = new Sequelize({
    database: process.env.POSTGRES_NAME,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    storage: ':memory:',
    models: [Category, Product, Basket, User, RefreshToken, UserRole, CharacteristicValue, Shop, ShopProduct, ProductCategory,
        Role, Order, Composition, Item, Characteristic, ProductCharacteristicValue, Detail, CategoryCharacteristic, Banner],
});