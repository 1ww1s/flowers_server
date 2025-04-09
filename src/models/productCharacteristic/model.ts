import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IProductCharacteristicValueDB } from "./types";


@Table({
    timestamps: false,
    tableName: 'productCharacteristic',
  })
class ProductCharacteristicValue extends Model<IProductCharacteristicValueDB> implements IProductCharacteristicValueDB {
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
    ProductId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    CharacteristicValueId!: number;
}

export {ProductCharacteristicValue}