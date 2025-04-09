import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IUserRole } from "./types";



@Table({
    timestamps: false,
    tableName: 'userRole',
  })
class UserRole extends Model<IUserRole> implements IUserRole {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    UserId!: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    RoleId!: number;
}

export {UserRole}