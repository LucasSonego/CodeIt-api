"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "id", {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("users", "id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    });
  },
};
