import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IBasket } from "./types";

@Table({
    timestamps: false,
    tableName: 'basket',
  })
class Basket extends Model<IBasket> implements IBasket {
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
    UserId!: number;
}

export {Basket}