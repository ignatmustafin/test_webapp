'use strict';

const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.createTable("cron_tasks", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      instance_id: { type: DataTypes.STRING, allowNull: true },
      added_to_queue_date: { type: DataTypes.DATE, allowNull: false },
      started_date: { type: DataTypes.DATE, allowNull: false },
      completed_date: { type: DataTypes.DATE, allowNull: false },
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable("cron_tasks");
  }
};
