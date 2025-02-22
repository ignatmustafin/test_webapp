import {Table, Column, Model, DataType, Min} from "sequelize-typescript";

@Table({
    tableName: "users",
    timestamps: false,
})
export class User extends Model {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id!: number;

    @Min(0)
    @Column({ type: DataType.INTEGER, allowNull: false})
    balance!: number;
}