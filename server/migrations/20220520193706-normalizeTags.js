'use strict';
const Tag = require('../api/models/tag')
const Event = require('../api/models/event')

module.exports = {
  async up (queryInterface, Sequelize) {
    const t = await sequelize.transaction()

    // search for all tags
    const tags = await Tag.findAll({
      order: [[Sequelize.literal('w'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('tag.tag')), 'w']]
      },
      include: [{ model: Event, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag']
    })

    console.error(tags)



    try {
      t.commit()
    } catch (e) {
      t.rollback()
    }

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
