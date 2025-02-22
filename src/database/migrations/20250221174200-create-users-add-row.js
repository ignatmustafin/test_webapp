'use strict';

const {DataTypes} = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up ({ context: queryInterface }) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable("users", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        balance: { type: DataTypes.INTEGER, allowNull: false },
      }, {transaction});

      const user = {
        balance: 10000,
      }

      await queryInterface.bulkInsert("users", [user], {transaction});
      await queryInterface.sequelize.query(`ALTER TABLE users ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);`, {transaction})
    })

  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable("users");
  }
};
