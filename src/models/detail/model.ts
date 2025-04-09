import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IDetail } from "./types";

@Table({
    timestamps: false,
    tableName: 'detail',
  })
class Detail extends Model<IDetail> implements IDetail {
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

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    ProductId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    OrderId!: number;
}

export {Detail}