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

const getSocket = () => sock
const setCallbacks = ({ onReady }) => { readyCallback = onReady }

const getVersion = async () => {
  if (cachedVersion) return cachedVersion
  try {
    const { version } = await fetchLatestBaileysVersion()
    cachedVersion = version
  } catch {
    cachedVersion = [2, 3000, 1015901307]
  }
  return cachedVersion
}

// ─── Main Bot Connection ──────────────────────────────────────────────────────
const connectToWhatsApp = async (sessionId = 'main') => {
  await getVersion()

  const sessionPath = path.join(config.sessionDir, sessionId)
  await fs.ensureDir(sessionPath)

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const version = await getVersion()

  sock = makeWASocket({
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
    markOnlineOnConnect: config.autoOnline,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id)
      return msg?.message || { conversation: 'Killer_XD Bot' }
    },
  })

  store?.bind(sock.ev)
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'open') {
      console.log(`✅ ${config.botName} connected!`)
      for (const ch of config.channels) {
        try { await sock.newsletterFollow(ch) } catch {}
      }
      if (readyCallback) readyCallback(sock)
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const reconnect = code !== DisconnectReason.loggedOut
      if (reconnect) setTimeout(() => connectToWhatsApp(sessionId), 5000)
    }
  })

  return sock
}

// ─── Pairing Code ─────────────────────────────────────────────────────────────
const requestPairingCode = async (phoneNumber) => {
  const phone = phoneNumber.replace(/[^0-9]/g, '')
  const sessionId = `pair_${phone}`
  const sessionPath = path.join(config.sessionDir, sessionId)

  // Always fresh session
  await fs.remove(sessionPath).catch(() => {})
  await fs.ensureDir(sessionPath)

  const version = await getVersion()
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  return new Promise((resolve, reject) => {
    let resolved = false

    const done = (err, code) => {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      if (err) reject(new Error(err))
      else resolve(code)
    }

    const timer = setTimeout(() => {
      done('Connection timed out. Render may be slow — wait 10 seconds and try again.')
    }, 60000)

    let pairSock

    try {
      pairSock = makeWASocket({
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
        keepAliveIntervalMs: 10000,
      })
    } catch (e) {
      return done(`Failed to create socket: ${e.message}`)
    }

    pairSock.ev.on('creds.update', saveCreds)

    // ✅ KEY FIX: Request pairing code RIGHT HERE — 
    // called immediately after socket creation, during the handshake
    if (!pairSock.authState.creds.registered) {
      pairSock.requestPairingCode(phone)
        .then(code => {
          console.log(`✅ Pairing code for ${phone}: ${code}`)
          done(null, code)
          // cleanup socket after 10 min
          setTimeout(() => {
            try { pairSock.ws?.close() } catch {}
            fs.remove(sessionPath).catch(() => {})
          }, 10 * 60 * 1000)
        })
        .catch(e => done(`WhatsApp rejected the request: ${e.message}`))
    } else {
      done('This number already has an active session. Delete sessions folder and try again.')
    }

    pairSock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode
        if (code === DisconnectReason.loggedOut) {
          done('WhatsApp rejected this connection.')
        }
      }
    })
  })
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
