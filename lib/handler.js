const config = require('../config')
const { getSocket } = require('./connection')

const getContentType = (msg) => {
  if (!msg) return null
  const types = [
    'conversation','imageMessage','videoMessage','audioMessage',
    'documentMessage','stickerMessage','extendedTextMessage',
    'buttonsResponseMessage','templateButtonReplyMessage',
    'messageContextInfo','reactionMessage','viewOnceMessage',
    'viewOnceMessageV2','editedMessage','locationMessage',
    'liveLocationMessage','contactMessage','contactsArrayMessage',
  ]
  return types.find((t) => msg[t]) || null
}

const getBody = (msg) => {
  const type = getContentType(msg)
  if (!type) return ''
  if (type === 'conversation') return msg.conversation
  if (type === 'imageMessage') return msg.imageMessage?.caption || ''
  if (type === 'videoMessage') return msg.videoMessage?.caption || ''
  if (type === 'extendedTextMessage') return msg.extendedTextMessage?.text || ''
  if (type === 'buttonsResponseMessage') return msg.buttonsResponseMessage?.selectedDisplayText || ''
  if (type === 'templateButtonReplyMessage') return msg.templateButtonReplyMessage?.selectedDisplayText || ''
  return ''
}

const getQuotedMsg = (msg) => {
  const type = getContentType(msg)
  if (type === 'extendedTextMessage') return msg.extendedTextMessage?.contextInfo?.quotedMessage || null
  return null
}

const reply = async (jid, text, quoted = null) => {
  const sock = getSocket()
  if (!sock) return
  await sock.sendMessage(jid, { text }, quoted ? { quoted } : {})
}

const react = async (jid, key, emoji) => {
  const sock = getSocket()
  if (!sock) return
  await sock.sendMessage(jid, { react: { text: emoji, key } })
}

const isAdmin = async (jid, sender) => {
  const sock = getSocket()
  if (!sock) return false
  try {
    const meta = await sock.groupMetadata(jid)
    const admins = meta.participants
      .filter((p) => p.admin)
      .map((p) => p.id)
    return admins.includes(sender)
  } catch {
    return false
  }
}

const isBotAdmin = async (jid) => {
  const sock = getSocket()
  if (!sock) return false
  try {
    const meta = await sock.groupMetadata(jid)
    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const admins = meta.participants
      .filter((p) => p.admin)
      .map((p) => p.id)
    return admins.includes(botId)
  } catch {
    return false
  }
}

const isOwner = (sender) => {
  const num = sender.replace('@s.whatsapp.net', '').split(':')[0]
  return config.owner.includes(num)
}

const formatNumber = (jid) => {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '')
}

const getMentionList = (participants) => participants.map((p) => p.id)

module.exports = {
  getContentType,
  getBody,
  getQuotedMsg,
  reply,
  react,
  isAdmin,
  isBotAdmin,
  isOwner,
  formatNumber,
  getMentionList,
}
