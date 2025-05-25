'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'to_notify', { type: Sequelize.BOOLEAN })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'to_notify')
  }
}
