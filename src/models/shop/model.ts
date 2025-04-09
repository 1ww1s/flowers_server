import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IShop } from "./types";

export const ShopAddress = "ул. Хрустальная, д. 46"

@Table({
    timestamps: false,
    tableName: 'shop',
  })
class Shop extends Model<IShop> implements IShop {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;

    @Column({
      type: DataType.STRING(160),
      allowNull: false,
      unique: true
    })
    title!: string;

    @Column({
      type: DataType.STRING(160),
      allowNull: false,
      unique: true
    })
    titleSlug!: string;
    
    @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true
    })
    address!: string;

    @Column({
      type: DataType.DOUBLE,
      allowNull: false,
      unique: true
    })
    coordinateX!: number;

    @Column({
      type: DataType.DOUBLE,
      allowNull: false,
      unique: true
    })
    coordinateY!: number;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    openingHours!: string;
}

export {Shop}