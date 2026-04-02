// Commands registry — loads all command modules
const fs = require('fs')
const path = require('path')

const commands = new Map()

// Load all command files
const cmdFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'index.js')
for (const file of cmdFiles) {
  const cmds = require(path.join(__dirname, file))
  for (const [name, handler] of Object.entries(cmds)) {
    commands.set(name, handler)
  }
}

module.exports = commands
