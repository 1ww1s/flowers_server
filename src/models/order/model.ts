import { Column, DataType, Model, Table } from "sequelize-typescript";
import { IOrder, TMethodOfReceipt, TMethodPayment, TStatus, TStatusPayment } from "./types";



@Table({
    timestamps: true,
    tableName: 'order',
  })
class Order extends Model<IOrder> implements IOrder {

    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;

    @Column({
      type: DataType.STRING(100),
      allowNull: false,
    })
    senderName!: string;

    // @Column({
    //   type: DataType.STRING(20),
    //   allowNull: false,
    // })
    // amount!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    paymentId!: string;

    @Column({
      type: DataType.STRING(100),
      allowNull: false,
    })
    senderPhone!: string;

    @Column({
      type: DataType.STRING(100),
      allowNull: false,
    })
    recipientName!: string;

    @Column({
      type: DataType.STRING(40),
      allowNull: false,
    })
    recipientPhone!: string;

    @Column({
      type: DataType.STRING(1000),
      allowNull: false,
    })
    message!: string;

    @Column({
      type: DataType.STRING(1000),
      allowNull: false,
    })
    deliveryMessage!: string;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    deliveryPrice!: number;

    @Column({
      type: DataType.STRING(600),
      allowNull: false,
    })
    address!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false,
      defaultValue: "Собирается"
    })
    statusOrder!: TStatus;
    
    @Column({
      type: DataType.STRING,
      allowNull: false,
      defaultValue: "Не оплачен"
    })
    statusPayment!: TStatusPayment;

    @Column({
      type: DataType.STRING,
      allowNull: false,
      defaultValue: "Самовызов"
    })
    methodOfReceipt!: TMethodOfReceipt;

    @Column({
      type: DataType.STRING,
      allowNull: false,
      defaultValue: "Банковской картой"
    })
    methodPayment!: TMethodPayment;

    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    ShopId!: number;
}

export {Order}