import {Table, Column, Model, DataType} from "sequelize-typescript";

@Table({
    tableName: "users",
    timestamps: false,
})
export class User extends Model {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id!: number;

    // min 0 added constraint in migration "20250221174200-create-users-add-row.js"
    @Column({ type: DataType.INTEGER, allowNull: false})
    balance!: number;
}