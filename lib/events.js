const config = require('../config')
const commands = require('../commands')
const { getBody, getContentType, isAdmin, isBotAdmin, isOwner } = require('./handler')

const handleMessage = async (sock, messages) => {
  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue

    const jid = msg.key.remoteJid
    const isGroup = jid?.endsWith('@g.us')
    const sender = isGroup ? msg.key.participant : msg.key.remoteJid
    if (!sender) continue

    const body = getBody(msg.message)
    const isCmd = body.startsWith(config.prefix)

    // Auto-read
    const senderNum = sender.split('@')[0]
    if (config.autoRead.has(senderNum)) {
      try { await sock.readMessages([msg.key]) } catch {}
    }

    // Auto-typing indicator
    if (config.autoTyping.has(senderNum) && isCmd) {
      try { await sock.sendPresenceUpdate('composing', jid) } catch {}
    }

    // Handle anti-delete (in messages-recv.js via 'messages.delete' event — handled below)

    // Handle anti-link
    if (isGroup && config.antiLinkGroups.has(jid)) {
      const linkRegex = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me)\/\S+/gi
      if (linkRegex.test(body) && !(await isAdmin(jid, sender))) {
        try {
          await sock.sendMessage(jid, {
            delete: msg.key,
          })
          await sock.groupParticipantsUpdate(jid, [sender], 'remove')
          await sock.sendMessage(jid, {
            text: `🚫 *Anti-Link Alert*\n\n@${sender.split('@')[0]} was removed for sending a WhatsApp group link!`,
            mentions: [sender],
          })
        } catch {}
        continue
      }
    }

    if (!isCmd) continue

    const [rawCmd, ...args] = body.slice(config.prefix.length).trim().split(/\s+/)
    const cmd = rawCmd.toLowerCase()

    const senderIsAdmin = isGroup ? await isAdmin(jid, sender) : false
    const senderIsOwner = isOwner(sender)

    // Quoted message context
    const type = getContentType(msg.message)
    let quoted = null
    if (type === 'extendedTextMessage' && msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      quoted = {
        key: {
          remoteJid: jid,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          participant: msg.message.extendedTextMessage.contextInfo.participant,
        },
        message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
      }
    }

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    const ctx = {
      sock,
      msg,
      jid,
      sender,
      isGroup,
      senderIsAdmin,
      senderIsOwner,
      args,
      body,
      quoted,
      mentions,
    }

    if (commands.has(cmd)) {
      try {
        // Show typing
        try { await sock.sendPresenceUpdate('composing', jid) } catch {}
        await commands.get(cmd)(ctx)
        try { await sock.sendPresenceUpdate('paused', jid) } catch {}
      } catch (e) {
        console.error(`Error in command [${cmd}]:`, e.message)
        try {
          await sock.sendMessage(jid, {
            text: `❌ *Command Error*\n\nAn error occurred while running \`.${cmd}\`\n\n\`${e.message}\`\n\n_Please try again or contact the owner._`,
          }, { quoted: msg })
        } catch {}
      }
    }
  }
}

const handleGroupUpdate = async (sock, events) => {
  for (const event of events) {
    const jid = event.id
    if (!jid) continue

    // Welcome message
    if (event.action === 'add' && config.welcomeGroups.has(jid)) {
      for (const participant of event.participants) {
        try {
          const meta = await sock.groupMetadata(jid)
          await sock.sendMessage(jid, {
            text: `
🎉 *Welcome to ${meta.subject}!*

👋 Hey @${participant.split('@')[0]}, welcome to the group!
👥 *Members:* ${meta.participants.length}
📌 *Rules:* Read the group description and respect everyone.
🤖 *Bot:* Type *.menu* to see all available commands!

_— Killer_XD Bot · Signature: ${config.signature}_
            `.trim(),
            mentions: [participant],
          })
        } catch {}
      }
    }

    // Goodbye message
    if (event.action === 'remove' && config.goodbyeGroups.has(jid)) {
      for (const participant of event.participants) {
        try {
          await sock.sendMessage(jid, {
            text: `
👋 *Goodbye!*

@${participant.split('@')[0]} has left the group. We'll miss you! 😢

_— Killer_XD Bot_
            `.trim(),
            mentions: [participant],
          })
        } catch {}
      }
    }
  }
}

const handleDeletedMessage = async (sock, deletedMsgs) => {
  // Anti-delete logic
  // This would need the store to retrieve original messages
  // The store is bound in connection.js
}

const handleStatusUpdate = async (sock, statuses) => {
  for (const status of statuses) {
    const sender = status.key.participant || status.key.remoteJid
    const senderNum = sender?.split('@')[0]

    // Auto-view status
    if (config.autoViewStatus.has(senderNum) || config.autoViewStatus.size === 0) {
      try {
        await sock.readMessages([status.key])
      } catch {}
    }

    // Auto-react status
    if (config.autoReactStatus.has(senderNum)) {
      const emojis = ['❤️', '🔥', '👏', '😍', '⚡', '💯', '🎉', '😂', '🫶', '✨']
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]
      try {
        await sock.sendMessage(status.key.remoteJid, {
          react: { text: emoji, key: status.key },
        })
      } catch {}
    }
  }
}

module.exports = { handleMessage, handleGroupUpdate, handleDeletedMessage, handleStatusUpdate }
