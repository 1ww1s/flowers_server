import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IMyUser } from "./types";



@Table({
    timestamps: false,
    tableName: 'myUser',
  })
class MyUser extends Model<IMyUser> implements IMyUser {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;

    @Column({
      type: DataType.STRING,
    })
    vk_id!: string;
  
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
    })
    password!: string;
}

export {MyUser}