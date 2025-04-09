import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IItem } from "./types";

@Table({
    timestamps: false,
    tableName: 'item',
  })
class Item extends Model<IItem> implements IItem {
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
}

export {Item}