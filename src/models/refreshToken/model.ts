import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IRefreshToken } from "./types";



@Table({
    timestamps: false,
    tableName: 'refreshToken',
  })
class RefreshToken extends Model<IRefreshToken> implements IRefreshToken {
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
    token!: string;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    UserId!: number;
}

export {RefreshToken}