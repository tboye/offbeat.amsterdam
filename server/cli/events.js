let db
function _initializeDB () {
  const config = require('../config')
  if (config.status !== 'CONFIGURED') {
    console.error(`> Cannot run CLI before setup (are you in the correct path?)`)
    process.exit(1)
  }
  config.log_level = 'error'
  db = require('../api/models/index')
  return db.initialize()
}

async function list () {
  await _initializeDB()
  const { Event } = require('../api/models/models')
  const events = await Event.findAll()
  console.log()
  events.forEach(u => console.log(`${u.id}\ttitle: ${u.title}\tstart_datetime: ${u.start_datetime}\tend_datetime: ${u.end_datetime}`))
  console.log()
  await db.close()
}

const eventsCLI = yargs => yargs
  .command('list', 'List all events', list)
  .recommendCommands()
  .demandCommand(1, '')
  .argv

module.exports = eventsCLI