const { Page } = require('../models/models')

const log = require('../../log')

const pageController = {
  async getAll (req, res) {
    const pages = await Page.findAll({ raw: true })
    return res.json(pages)
  },

  async get (req, res) {
    const slug = req.params.page_slug
    const allowed = req?.user?.is_admin || req?.user?.is_editor

    try {
      const page = await Page.findOne({ where: { slug, ...( !allowed && { visible: true }) }})
      return res.json(page)
    } catch (e) {
      log.error('Get page failed:', String(e))
      return res.sendStatus(404)      
    }
  },

  async add (req, res) {
    const pageDetail = {
      title: req.body.title,
      content: req.body.content,
      visible: true
    }
    log.info('Create page: ' + req.body.title)
    const page = await Page.create(pageDetail)
    res.json(page)
  },

  async update (req, res) {
    const pageDetails = {
      title: req.body.title,
      content: req.body.content,
      visible: req.body.visible
    }
    const page_id = req.params.page_id
    try {
      let page = await Page.findByPk(page_id)
      page = await page.update(pageDetails)
      res.json(page)
    } catch (e) {
      log.error('Toggle page failed', e)
      res.sendStatus(404)
    }
  },

  async remove (req, res) {
    log.info('Remove page ', req.params.page_id)
    const page_id = req.params.page_id
    try {
      const page = await Page.findByPk(page_id)
      await page.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove page failed:', e)
      res.sendStatus(404)
    }
  }

}

module.exports = pageController