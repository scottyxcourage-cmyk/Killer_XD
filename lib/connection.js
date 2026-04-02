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
    console.log(`[VERSION] Using WA version: ${version.join('.')}`)
  } catch (e) {
    cachedVersion = [2, 3000, 1015901307]
    console.log(`[VERSION] Fallback version used. Error: ${e.message}`)
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
    console.log(`[MAIN] connection.update:`, connection)
    if (connection === 'open') {
      console.log(`✅ ${config.botName} connected!`)
      for (const ch of config.channels) {
        try { await sock.newsletterFollow(ch) } catch {}
      }
      if (readyCallback) readyCallback(sock)
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const reconnect = code !== DisconnectReason.loggedOut
      console.log(`[MAIN] Closed with code ${code}. Reconnect: ${reconnect}`)
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

  console.log(`[PAIR] Starting pairing for: ${phone}`)

  // Always fresh session
  await fs.remove(sessionPath).catch(() => {})
  await fs.ensureDir(sessionPath)

  const version = await getVersion()
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  console.log(`[PAIR] Creating socket...`)

  const suki = makeWASocket({
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

  suki.ev.on('creds.update', saveCreds)

  // Log all connection state changes
  suki.ev.on('connection.update', (update) => {
    console.log(`[PAIR] connection.update for ${phone}:`, JSON.stringify(update))
  })

  console.log(`[PAIR] Socket created. creds.registered = ${suki.authState.creds.registered}`)

  if (suki.authState.creds.registered) {
    try { suki.ws?.close() } catch {}
    throw new Error('Number already has an active session. Contact owner to reset.')
  }

  // Wait for first WS handshake to begin before requesting code
  console.log(`[PAIR] Waiting 3s for WS handshake to begin...`)
  await new Promise(r => setTimeout(r, 3000))

  console.log(`[PAIR] Requesting pairing code for ${phone}...`)

  try {
    const code = await suki.requestPairingCode(phone)
    console.log(`[PAIR] ✅ Code received: ${code}`)

    // Cleanup after 10 min
    setTimeout(() => {
      try { suki.ws?.close() } catch {}
      fs.remove(sessionPath).catch(() => {})
    }, 10 * 60 * 1000)

    return code
  } catch (e) {
    console.log(`[PAIR] ❌ requestPairingCode failed: ${e.message}`)
    try { suki.ws?.close() } catch {}
    await fs.remove(sessionPath).catch(() => {})
    throw new Error(`Failed to get code: ${e.message}`)
  }
}

module.exports = { connectToWhatsApp, requestPairingCode, getSocket, setCallbacks, store }
