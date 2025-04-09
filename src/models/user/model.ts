import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IUser } from "./types";



@Table({
    timestamps: false,
    tableName: 'user',
  })
class User extends Model<IUser> implements IUser {
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
    phone!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    password!: string;
}

export {User}