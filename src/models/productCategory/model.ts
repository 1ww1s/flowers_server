import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IProductCategory } from "./types";


@Table({
    timestamps: false,
    tableName: 'productCategory',
  })
class ProductCategory extends Model<IProductCategory> implements IProductCategory {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    ProductId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    CategoryId!: number;
}

export {ProductCategory}