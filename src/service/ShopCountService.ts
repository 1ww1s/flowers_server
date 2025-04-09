// import { DatabaseError } from "../error/DatabaseError";
// import { ShopCount } from "../models";


// class ShopCountService {

//     async create(count: number, ProductId: number){
//         return await ShopCount.create({count, ProductId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
//     }

//     async update(count: number, ProductId: number){
//         return await ShopCount.update({count}, {where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
//     }

//     async get(ProductId: number){
//         return await ShopCount.findOne({where: {ProductId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
//     }
// }

// export const shopCountService = new ShopCountService()