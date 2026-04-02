const config = require('../config')

const autoreactstatus = async ({ sock, msg, jid, sender, senderIsOwner }) => {
  const num = sender.split('@')[0]
  if (config.autoReactStatus.has(num)) {
    config.autoReactStatus.delete(num)
    await sock.sendMessage(jid, { text: '💫 *Auto React Status DISABLED*\n\nI will no longer react to your status updates.' }, { quoted: msg })
  } else {
    config.autoReactStatus.add(num)
    await sock.sendMessage(jid, { text: '❤️ *Auto React Status ENABLED*\n\nI will automatically react to all your WhatsApp status updates with random emojis! 🎉' }, { quoted: msg })
  }
}

const autoviewstatus = async ({ sock, msg, jid, sender }) => {
  const num = sender.split('@')[0]
  if (config.autoViewStatus.has(num)) {
    config.autoViewStatus.delete(num)
    await sock.sendMessage(jid, { text: '👁️ *Auto View Status DISABLED*\n\nStatus views are no longer automatic.' }, { quoted: msg })
  } else {
    config.autoViewStatus.add(num)
    await sock.sendMessage(jid, { text: '👁️ *Auto View Status ENABLED*\n\nAll status updates in your contact list will be viewed automatically! 🔥' }, { quoted: msg })
  }
}

const autoread = async ({ sock, msg, jid, sender }) => {
  const num = sender.split('@')[0]
  if (config.autoRead.has(num)) {
    config.autoRead.delete(num)
    await sock.sendMessage(jid, { text: '📩 *Auto Read DISABLED*\n\nMessages will no longer be marked as read automatically.' }, { quoted: msg })
  } else {
    config.autoRead.add(num)
    await sock.sendMessage(jid, { text: '✅ *Auto Read ENABLED*\n\nAll incoming messages will be marked as read automatically!' }, { quoted: msg })
  }
}

const autotyping = async ({ sock, msg, jid, sender }) => {
  const num = sender.split('@')[0]
  if (config.autoTyping.has(num)) {
    config.autoTyping.delete(num)
    await sock.sendMessage(jid, { text: '⌨️ *Auto Typing Indicator DISABLED*' }, { quoted: msg })
  } else {
    config.autoTyping.add(num)
    await sock.sendMessage(jid, { text: '⌨️ *Auto Typing Indicator ENABLED*\n\nThe bot will show "typing..." before sending every message! 💬' }, { quoted: msg })
  }
}

const autoonline = async ({ sock, msg, jid, senderIsOwner }) => {
  if (!senderIsOwner) return sock.sendMessage(jid, { text: '❌ Only the bot owner can change online status.' }, { quoted: msg })

  config.autoOnline = !config.autoOnline
  await sock.sendPresenceUpdate(config.autoOnline ? 'available' : 'unavailable')
  await sock.sendMessage(jid, {
    text: config.autoOnline
      ? '🟢 *Auto Online ENABLED*\n\nBot will always appear online!'
      : '⭕ *Auto Online DISABLED*\n\nBot will appear offline when idle.',
  }, { quoted: msg })
}

module.exports = { autoreactstatus, autoviewstatus, autoread, autotyping, autoonline }
