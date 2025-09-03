"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "description");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Categories", "description", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
