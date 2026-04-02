const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs-extra')
const config = require('./config')
const { connectToWhatsApp, requestPairingCode, setCallbacks } = require('./lib/connection')
const { handleMessage, handleGroupUpdate, handleDeletedMessage, handleStatusUpdate } = require('./lib/events')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'web')))

// Track pairing sessions
const pairingSessions = new Map()

// ─── Web Routes ────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'))
})

app.get('/status', (req, res) => {
  res.json({ status: 'online', bot: config.botName, signature: config.signature, version: '1.0.0' })
})

app.post('/pair', async (req, res) => {
  const { phone } = req.body
  if (!phone || !/^\d{7,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number. Use country code without + (e.g. 2637XXXXXXXX)' })
  }

  const sessionId = `session_${phone}`

  try {
    // Start a new connection for this phone if not already started
    if (!pairingSessions.has(phone)) {
      await connectToWhatsApp(sessionId)
      pairingSessions.set(phone, sessionId)
      // Give socket time to initialize
      await new Promise(r => setTimeout(r, 3000))
    }

    const code = await requestPairingCode(phone, sessionId)
    if (!code) throw new Error('Could not generate code')

    // Format code nicely XXXX-XXXX
    const formatted = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
    res.json({ code: formatted, phone })
  } catch (e) {
    console.error('Pairing error:', e.message)
    pairingSessions.delete(phone)
    res.status(500).json({ error: `Failed: ${e.message}. Please wait 30 seconds and try again.` })
  }
})

// ─── Main Bot Connection ────────────────────────────────────────────────────────

let mainSock = null

const startMainBot = async () => {
  console.log(`\n⚡ Starting ${config.botName} Bot...`)
  console.log(`✍️  Signature: ${config.signature}`)
  console.log(`📡 Channels to follow: ${config.channels.length}`)

  setCallbacks({
    onQR: (qr) => {
      console.log('📱 QR Code generated (use pairing code instead via web UI)')
    },
    onReady: (sock) => {
      mainSock = sock
      console.log(`\n✅ ${config.botName} is fully connected and ready!`)
      bindEvents(sock)
    },
  })

  await connectToWhatsApp('main')
}

const bindEvents = (sock) => {
  // Incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    await handleMessage(sock, messages)
  })

  // Group participant updates (welcome/goodbye)
  sock.ev.on('group-participants.update', async (event) => {
    await handleGroupUpdate(sock, [event])
  })

  // Anti-delete: listen for message deletions
  sock.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      if (update.update?.messageStubType === 68 || update.update?.status === 'DELETED') {
        const jid = update.key.remoteJid
        if (config.antiDeleteGroups.has(jid)) {
          // Try to get original from store
          try {
            const { store } = require('./lib/connection')
            const original = store?.loadMessage?.(jid, update.key.id)
            if (original?.message) {
              const senderNum = (update.key.participant || update.key.remoteJid).split('@')[0]
              await sock.sendMessage(jid, {
                text: `🛡️ *Anti-Delete Alert*\n\n@${senderNum} deleted a message!\n\n_Killer_XD has restored it below ⬇️_`,
                mentions: [update.key.participant || update.key.remoteJid],
              })
              await sock.sendMessage(jid, original.message)
            }
          } catch {}
        }
      }
    }
  })

  // Status updates
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const statusMsgs = messages.filter(m => m.key.remoteJid === 'status@broadcast')
    if (statusMsgs.length) await handleStatusUpdate(sock, statusMsgs)
  })

  console.log('🎧 Event listeners bound successfully.')
}

// ─── Start Server ───────────────────────────────────────────────────────────────

const PORT = config.port
app.listen(PORT, async () => {
  console.log(`\n🌐 Web server running at http://localhost:${PORT}`)
  console.log(`🔗 Pairing page: http://localhost:${PORT}/`)
  await startMainBot()
})

process.on('uncaughtException', (e) => console.error('Uncaught Exception:', e.message))
process.on('unhandledRejection', (e) => console.error('Unhandled Rejection:', e?.message || e))
