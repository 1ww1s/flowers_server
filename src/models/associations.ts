import { connection } from "./db";

import { Basket } from "./basket/model";
import { Category } from "./category/model";
import { Characteristic } from "./characteristic/model";
import { Composition } from "./composition/model";
import { Detail } from "./detail/model";
import { Item } from "./item/model";
import { Order } from "./order/model";
import { Product } from "./product/model";
import { ProductCharacteristicValue } from "./productCharacteristic/model";
import { CharacteristicValue } from "./characteristicValue/model";
import { CategoryCharacteristic } from "./categoryCharacteristic/model"
import { RefreshToken } from "./refreshToken/model";
import { Role } from "./role/model";
import { Shop } from "./shop/model";
import { ShopProduct } from "./shopProduct/model";
import { MyUser } from "./user/model";
import { UserRole } from "./userRole/model";
import { ProductCategory } from "./productCategory/model";


Category.belongsToMany(Product, {through: ProductCategory, onDelete: 'CASCADE'})
Product.belongsToMany(Category, {through: ProductCategory})

Item.belongsToMany(Product, {through: Composition, onDelete: 'CASCADE'})
Product.belongsToMany(Item, {through: Composition, onDelete: 'CASCADE'})

Category.belongsToMany(Characteristic, {through: CategoryCharacteristic, onDelete: 'CASCADE'})
Characteristic.belongsToMany(Category, {through: CategoryCharacteristic})

Characteristic.hasMany(CharacteristicValue, {onDelete: 'CASCADE'})
CharacteristicValue.belongsTo(Characteristic)

Product.belongsToMany(CharacteristicValue, {through: ProductCharacteristicValue, onDelete: 'CASCADE'})
CharacteristicValue.belongsToMany(Product, {through: ProductCharacteristicValue, onDelete: 'CASCADE'})

Product.belongsToMany(MyUser, {through: Basket, onDelete: 'CASCADE'})
MyUser.belongsToMany(Product, {through: Basket, onDelete: 'CASCADE'})

MyUser.belongsToMany(Role, {through: UserRole, onDelete: 'CASCADE'})
Role.belongsToMany(MyUser, {through: UserRole, onDelete: 'CASCADE'})

// Product.hasOne(ShopCount, {onDelete: 'CASCADE'})
// ShopCount.belongsTo(Product)

Shop.belongsToMany(Product, {through: ShopProduct, onDelete: 'CASCADE'})
Product.belongsToMany(Shop, {through: ShopProduct, onDelete: 'CASCADE'})

MyUser.hasOne(RefreshToken, {onDelete: 'CASCADE'})
RefreshToken.belongsTo(MyUser)

Product.belongsToMany(Order, {through: Detail})
Order.belongsToMany(Product, {through: Detail})

Shop.hasMany(Order, {onDelete: 'CASCADE'})
Order.belongsTo(Shop)

export {connection}