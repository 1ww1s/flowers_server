import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IShopProductDB } from "./types";



@Table({
    timestamps: false,
    tableName: 'shopProduct',
  })
class ShopProduct extends Model<IShopProductDB> implements IShopProductDB {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    count!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    ProductId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    ShopId!: number;
}

export {ShopProduct}