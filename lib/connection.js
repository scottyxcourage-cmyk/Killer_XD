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

// ─── Pairing Code — exact pattern from @malzmc/baileys docs ──────────────────
const requestPairingCode = async (phoneNumber) => {
  const phone = phoneNumber.replace(/[^0-9]/g, '')
  const sessionId = `pair_${phone}`
  const sessionPath = path.join(config.sessionDir, sessionId)

  // Always use a fresh session for pairing
  await fs.remove(sessionPath).catch(() => {})
  await fs.ensureDir(sessionPath)

  const version = await getVersion()
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  // ✅ Exact pattern from modded Baileys docs
  const suki = makeWASocket({
    version,
    logger,
    printQRInTerminal: false, // must be false for pairing code
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

  suki.ev.on('creds.update', saveCreds)

  // ✅ Check registered then request — exactly as shown in docs
  if (!suki.authState.creds.registered) {
    const code = await suki.requestPairingCode(phone)
    console.log(`✅ Pairing code for ${phone}: ${code}`)

    // Cleanup socket after 10 minutes
    setTimeout(() => {
      try { suki.ws?.close() } catch {}
      fs.remove(sessionPath).catch(() => {})
    }, 10 * 60 * 1000)

    return code
  } else {
    // Already registered — close and return error
    try { suki.ws?.close() } catch {}
    throw new Error('This number already has an active session.')
  }
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
