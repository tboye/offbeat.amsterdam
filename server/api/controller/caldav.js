const { Collection, Filter, Event, Tag, Place } = require('../models/models')

const log = require('../../log')
const { col: Col, queryParamToBool } = require('../../helpers')
const { Op, Sequelize } = require('sequelize')

const caldavController = {

  async wellknown (req, res) {
    
  }
  
}

module.exports = caldavController