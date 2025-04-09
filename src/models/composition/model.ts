import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ICompositionDB } from "./types";



@Table({
    timestamps: false,
    tableName: 'composition',
  })
class Composition extends Model<ICompositionDB> implements ICompositionDB {
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
    ItemId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    ProductId!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    count!: number;
}

export {Composition}