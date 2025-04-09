import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ICategory } from "./types";



@Table({
    timestamps: false,
    tableName: 'category',
  })
class Category extends Model<ICategory> implements ICategory {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    name!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    slug!: string;

    @Column({
      type: DataType.TEXT,
      allowNull: false,
    })
    image!: string;
}
  
export {Category}