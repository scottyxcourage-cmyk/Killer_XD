const config = {
  botName: 'Killer_XD',
  prefix: '.',
  owner: ['263788114185'], // Change to your number
  signature: 'Scotty',
  channels: [
    '120363406322987320@newsletter',
    '120363416932827122@newsletter'
  ],
  sessionDir: './sessions',
  port: process.env.PORT || 3000,
  packname: 'Killer_XD',
  author: 'Scotty',
  // Anti-features state (per group, stored in memory)
  antiDeleteGroups: new Set(),
  antiLinkGroups: new Set(),
  welcomeGroups: new Set(),
  goodbyeGroups: new Set(),
  muteGroups: new Set(),
  autoReactStatus: new Set(),
  autoViewStatus: new Set(),
  autoRead: new Set(),
  autoTyping: new Set(),
  autoOnline: false,
}

module.exports = config
