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

async function get (args) {
  await _initializeDB()
  const settingsController = require('../api/controller/settings')
  await settingsController.load()
  console.log()
  if (!Object.keys(settingsController.settings).includes(args.setting)) {
    console.error(`Setting "${args.setting}" does not exists`)
  } else {
    console.log(`${args.setting}: ${JSON.stringify(settingsController.settings[args.setting])}`)
  }
  console.log()
  await db.close()
}

async function set (args) {
  await _initializeDB()
  const settingsController = require('../api/controller/settings')
  await settingsController.load()
  console.log()
  if (!Object.keys(settingsController.settings).includes(args.setting)) {
    console.error(`Setting "${args.setting}" does not exists`)
  } else {
    console.log(args.setting)
    console.log(`Old value: ${JSON.stringify(settingsController.settings[args.setting])}`)
    console.warn(`New value: ${args.value}`)
    if (args.setting === 'instance_name') {
      console.error('\nNote that this will likely break current federation (all your follower / following connections will be destroyed)!')
    }
    console.error('\nNote that a restart is needed to get the new setting')
    await settingsController.set(args.setting, JSON.parse(args.value))
  }
  console.log()
  await db.close()
}

async function list () {
  await _initializeDB()
  const settingsController = require('../api/controller/settings')
  await settingsController.load()
  console.log()

  for(const [key, value]  of Object.entries(settingsController.settings)) {
    console.log(`${key}: ${JSON.stringify(value)}`)
  }
  console.log()
  await db.close()
}

const settingsCLI = yargs => yargs
  .command('list', 'List all settings', list)
  .command('get <setting>', 'Get value of specified setting', { }, get)
  .command('set <setting> <value>', 'Set value of specified setting', { }, set)
  .recommendCommands()
  .demandCommand(1, '')
  .argv

module.exports = settingsCLI