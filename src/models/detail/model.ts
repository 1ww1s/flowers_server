import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { IDetail } from "./types";
import { Order } from "../order/model";
import { Product } from "../product/model";

@Table({
    timestamps: false,
    tableName: 'detail',
  })
class Detail extends Model<IDetail> implements IDetail {

    @Column({
      allowNull: false,
      onDelete: 'CASCADE', // Каскадное удаление при удалении Order
    })
    OrderId!: number;

    @ForeignKey(() => Product)
    @Column({
      allowNull: false,
      onDelete: 'CASCADE', // Каскадное удаление при удалении Product
    })
    ProductId!: number;

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
    price!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    count!: number;
}

export {Detail}