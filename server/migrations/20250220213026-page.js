'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: Sequelize.STRING,
      content: {
        type: Sequelize.STRING
      },
      visible: Sequelize.BOOLEAN,
      slug: {
        type: Sequelize.STRING,
        index: true,
        unique: true
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('pages')
  }
};
