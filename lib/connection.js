const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  makeInMemoryStore,
  jidNormalizedUser,
} = require('@malzmc/baileys')
const pino = require('pino')
const path = require('path')
const fs = require('fs-extra')
const config = require('../config')

const logger = pino({ level: 'silent' })
const store = makeInMemoryStore({ logger })

let sock = null
let qrCallback = null
let pairingCallback = null
let readyCallback = null

const getSocket = () => sock

const setCallbacks = ({ onQR, onPairing, onReady }) => {
  qrCallback = onQR
  pairingCallback = onPairing
  readyCallback = onReady
}

const connectToWhatsApp = async (sessionId = 'main') => {
  const sessionPath = path.join(config.sessionDir, sessionId)
  await fs.ensureDir(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['Killer_XD', 'Chrome', '120.0.0'],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: config.autoOnline,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }
      return { conversation: 'Killer_XD Bot' }
    },
  })

  store?.bind(sock.ev)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr && qrCallback) qrCallback(qr)

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(`❌ Connection closed. Reconnecting: ${shouldReconnect}`)
      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(sessionId), 5000)
      }
    } else if (connection === 'open') {
      console.log(`✅ Killer_XD Bot connected!`)

      // Auto-join channels
      for (const channel of config.channels) {
        try {
          await sock.newsletterFollow(channel)
          console.log(`📢 Followed channel: ${channel}`)
        } catch (e) {
          console.log(`⚠️ Could not follow channel ${channel}: ${e.message}`)
        }
      }

      if (readyCallback) readyCallback(sock)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}

const requestPairingCode = async (phoneNumber, sessionId = 'main') => {
  if (!sock) await connectToWhatsApp(sessionId)
  const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''))
  return code
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
