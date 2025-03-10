import {Table, Column, Model, DataType} from "sequelize-typescript";

@Table({
    tableName: "cron_tasks",
    timestamps: false,
})
export class CronTask extends Model {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id!: number;

    @Column({ type: DataType.STRING, allowNull: false})
    name!: string;

    @Column({ type: DataType.STRING, allowNull: true, field: 'instance_id'})
    instanceId?: string | null;

    @Column({ type: DataType.DATE, allowNull: false, field: 'added_to_queue_date'})
    addedToQueueDate!: Date;

    @Column({ type: DataType.DATE, allowNull: false, field: 'started_date'})
    startedDate!: Date;

    @Column({ type: DataType.DATE, allowNull: false, field: 'completed_date'})
    completedDate!: Date;
}