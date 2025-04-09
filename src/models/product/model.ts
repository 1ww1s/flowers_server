import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IProduct } from "./types";


@Table({
    timestamps: false,
    tableName: 'product',
  })
class Product extends Model<IProduct> implements IProduct {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true
    })
    name!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true
    })
    slug!: string;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    price!: number;

    @Column({
      type: DataType.ARRAY(DataType.TEXT),
    })
    images!: string[];
  
    @Column({
      type: DataType.TEXT,
    })
    description!: string;
    
}

export {Product}