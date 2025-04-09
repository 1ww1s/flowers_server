
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ICharacteristicValue } from "./types";




@Table({
    timestamps: false,
    tableName: 'characteristicValue'
})
class CharacteristicValue extends Model<ICharacteristicValue> implements ICharacteristicValue {
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
    value!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    slug!: string;
  
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    CharacteristicId!: number;
}

export {CharacteristicValue}