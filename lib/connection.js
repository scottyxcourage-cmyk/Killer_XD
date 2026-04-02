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

let sock = null
let readyCallback = null
let cachedVersion = null

const pairingSockets = new Map()

const getSocket = () => sock
const setCallbacks = ({ onReady }) => { readyCallback = onReady }

// Fetch WA version once at startup, reuse for all pairing sockets
const getVersion = async () => {
  if (cachedVersion) return cachedVersion
  try {
    const { version } = await fetchLatestBaileysVersion()
    cachedVersion = version
    console.log(`📱 WA version: ${version.join('.')}`)
  } catch {
    cachedVersion = [2, 3000, 1015901307]
    console.log('⚠️ Using fallback WA version')
  }
  return cachedVersion
}

// Core socket factory
const createSocket = async (sessionId, onOpen, onClose) => {
  const sessionPath = path.join(config.sessionDir, sessionId)
  await fs.ensureDir(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const version = await getVersion()

  const socket = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['Killer_XD', 'Chrome', '120.0.0'],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
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
  await getVersion() // pre-cache on startup

  const onOpen = async (s) => {
    sock = s
    console.log(`\n✅ ${config.botName} connected!`)
    for (const channel of config.channels) {
      try {
        await sock.newsletterFollow(channel)
        console.log(`📢 Followed: ${channel}`)
      } catch {}
    }
    if (readyCallback) readyCallback(sock)
  }

  const onClose = (code) => {
    const reconnect = code !== DisconnectReason.loggedOut
    console.log(`❌ Closed (${code}). Reconnect: ${reconnect}`)
    if (reconnect) setTimeout(() => connectToWhatsApp(sessionId), 5000)
  }

  sock = await createSocket(sessionId, onOpen, onClose)
  return sock
}

// ─── Pairing Code ─────────────────────────────────────────────────────────────
const requestPairingCode = (phoneNumber) => {
  return new Promise(async (resolve, reject) => {
    const phone = phoneNumber.replace(/[^0-9]/g, '')
    const sessionId = `pair_${phone}`
    const sessionPath = path.join(config.sessionDir, sessionId)

    // Kill old socket for same phone
    if (pairingSockets.has(phone)) {
      try { pairingSockets.get(phone)?.ws?.close() } catch {}
      pairingSockets.delete(phone)
      await new Promise(r => setTimeout(r, 1000))
    }

    // Always start fresh — remove old session
    await fs.remove(sessionPath).catch(() => {})

    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        pairingSockets.delete(phone)
        reject(new Error('Connection timeout. Please try again in a moment.'))
      }
    }, 60000)

    const onOpen = async (s) => {
      if (resolved) return
      try {
        console.log(`📲 Socket open for ${phone}, requesting code...`)
        await new Promise(r => setTimeout(r, 1500))
        const code = await s.requestPairingCode(phone)
        if (!code) throw new Error('Empty code returned')
        resolved = true
        clearTimeout(timeout)
        pairingSockets.set(phone, s)
        console.log(`✅ Code generated for ${phone}`)
        resolve(code)

        // Cleanup after 10 min
        setTimeout(async () => {
          try { s.ws?.close() } catch {}
          pairingSockets.delete(phone)
          await fs.remove(sessionPath).catch(() => {})
        }, 10 * 60 * 1000)

      } catch (e) {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          pairingSockets.delete(phone)
          reject(new Error(`Could not generate code: ${e.message}`))
        }
      }
    }

    const onClose = (code) => {
      if (!resolved && code === DisconnectReason.loggedOut) {
        resolved = true
        clearTimeout(timeout)
        pairingSockets.delete(phone)
        reject(new Error('Rejected by WhatsApp. Try again.'))
      }
    }

    try {
      const s = await createSocket(sessionId, onOpen, onClose)
      pairingSockets.set(phone, s)
    } catch (e) {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        reject(new Error(`Socket failed: ${e.message}`))
      }
    }
  })
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
