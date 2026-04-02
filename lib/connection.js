const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
} = require('@malzmc/baileys')
const pino = require('pino')
const path = require('path')
const fs = require('fs-extra')
const config = require('../config')

const logger = pino({ level: 'silent' })
const store = makeInMemoryStore({ logger })

// Main bot socket
let sock = null
let readyCallback = null

// Per-user pairing sockets: phone -> { sock, resolve, reject }
const pairingSockets = new Map()

const getSocket = () => sock

const setCallbacks = ({ onReady }) => {
  readyCallback = onReady
}

const createSocket = async (sessionId, onOpen, onClose) => {
  const sessionPath = path.join(config.sessionDir, sessionId)
  await fs.ensureDir(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const socket = makeWASocket({
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
      const msg = await store.loadMessage(key.remoteJid, key.id)
      return msg?.message || { conversation: 'Killer_XD Bot' }
    },
  })

  store?.bind(socket.ev)
  socket.ev.on('creds.update', saveCreds)

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'open') {
      if (onOpen) onOpen(socket)
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      if (onClose) onClose(code)
    }
  })

  return socket
}

// ─── Main Bot Connection ──────────────────────────────────────────────────────
const connectToWhatsApp = async (sessionId = 'main') => {
  const onOpen = async (s) => {
    sock = s
    console.log(`✅ Killer_XD Bot connected!`)

    for (const channel of config.channels) {
      try {
        await sock.newsletterFollow(channel)
        console.log(`📢 Followed channel: ${channel}`)
      } catch (e) {
        console.log(`⚠️ Could not follow: ${channel}`)
      }
    }

    if (readyCallback) readyCallback(sock)
  }

  const onClose = (code) => {
    const shouldReconnect = code !== DisconnectReason.loggedOut
    console.log(`❌ Main connection closed (code ${code}). Reconnect: ${shouldReconnect}`)
    if (shouldReconnect) setTimeout(() => connectToWhatsApp(sessionId), 5000)
  }

  sock = await createSocket(sessionId, onOpen, onClose)
  return sock
}

// ─── Pairing Code (per user) ──────────────────────────────────────────────────
const requestPairingCode = (phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    const phone = phoneNumber.replace(/[^0-9]/g, '')
    const sessionId = `pair_${phone}`

    // Clean up any old socket for this phone
    if (pairingSockets.has(phone)) {
      try { pairingSockets.get(phone).sock?.ws?.close() } catch {}
      pairingSockets.delete(phone)
    }

    const timeout = setTimeout(() => {
      pairingSockets.delete(phone)
      reject(new Error('Timed out waiting for WhatsApp connection. Try again.'))
    }, 30000)

    const onOpen = async (s) => {
      try {
        // Must request BEFORE WhatsApp registers the device
        const code = await s.requestPairingCode(phone)
        clearTimeout(timeout)
        pairingSockets.set(phone, { sock: s })
        resolve(code)

        // After pairing, clean up this session socket after 5 minutes
        setTimeout(() => {
          try { s.ws?.close() } catch {}
          pairingSockets.delete(phone)
          // Clean up session folder
          const sessionPath = path.join(config.sessionDir, sessionId)
          fs.remove(sessionPath).catch(() => {})
        }, 5 * 60 * 1000)

      } catch (e) {
        clearTimeout(timeout)
        pairingSockets.delete(phone)
        reject(new Error(`Failed to get pairing code: ${e.message}`))
      }
    }

    const onClose = (code) => {
      if (code === DisconnectReason.loggedOut) {
        clearTimeout(timeout)
        pairingSockets.delete(phone)
      }
    }

    try {
      await createSocket(sessionId, onOpen, onClose)
    } catch (e) {
      clearTimeout(timeout)
      reject(e)
    }
  })
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
