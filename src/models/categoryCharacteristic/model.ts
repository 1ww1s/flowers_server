import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ICategoryCharacteristic } from "./types";




@Table({
    timestamps: false,
    tableName: 'categoryCharacteristic'
})
class CategoryCharacteristic extends Model<ICategoryCharacteristic> implements ICategoryCharacteristic {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;

    @Column({
        type: DataType.NUMBER,
        allowNull: false
    })
    CategoryId!: number;

    @Column({
        type: DataType.NUMBER,
        allowNull: false
    })
    CharacteristicId!: number;
}

export {CategoryCharacteristic}