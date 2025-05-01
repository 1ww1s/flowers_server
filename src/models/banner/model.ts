import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IBanner } from "./types";

@Table({
    timestamps: false,
    tableName: 'banner',
  })
class Banner extends Model<IBanner> implements IBanner {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING(5242880),  // 5mb
      allowNull: false,
    })
    imageMobile!: string;
    
    @Column({
      type: DataType.STRING(5242880),  // 5mb
      allowNull: false,
    })
    imageDesctop!: string;
    
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.STRING(400),
        allowNull: false,
    })
    sign!: string;

    @Column({
        type: DataType.STRING(300),
        allowNull: false,
    })
    buttonLink!: string;
}

export {Banner}