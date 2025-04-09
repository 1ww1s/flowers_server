import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IRole } from "./types";



@Table({
    timestamps: false,
    tableName: 'role',
  })
class Role extends Model<IRole> implements IRole {
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
    role!: string;
}
  

export {Role}