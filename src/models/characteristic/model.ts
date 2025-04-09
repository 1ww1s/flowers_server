import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ICharacteristic } from "./types";



@Table({
    timestamps: false,
    tableName: 'characteristic',
  })
class Characteristic extends Model<ICharacteristic> implements ICharacteristic {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING,
      unique: true,
      allowNull: false,
    })
    name!: string;
    @Column({
      type: DataType.STRING,
      unique: true,
      allowNull: false,
    })
    slug!: string;
    // @HasMany(() => CharacteristicValue)
    // characteristicValued
}

export {Characteristic}