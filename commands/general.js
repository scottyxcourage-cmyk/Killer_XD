const config = require('../config')

const menu = async ({ sock, msg, jid }) => {
  const menuText = `
╔══════════════════════════╗
║   ⚡ *KILLER_XD BOT* ⚡   ║
╚══════════════════════════╝

> *Prefix:* \`${config.prefix}\`  |  *Signature:* ${config.signature}
> *Status:* 🟢 Online  |  *Version:* v1.0.0

━━━━━━━━━━━━━━━━━━━
🛡️ *GROUP MANAGEMENT*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}antidelete\` — Restore deleted msgs
› \`${config.prefix}antilink\` — Block group links
› \`${config.prefix}welcome\` — Enable welcome msg
› \`${config.prefix}goodbye\` — Enable goodbye msg
› \`${config.prefix}tagall\` — Mention everyone
› \`${config.prefix}kick\` @user — Remove member
› \`${config.prefix}promote\` @user — Make admin
› \`${config.prefix}demote\` @user — Remove admin
› \`${config.prefix}mute\` — Mute group chat
› \`${config.prefix}unmute\` — Unmute group chat
› \`${config.prefix}listadmins\` — Show admins
› \`${config.prefix}listmembers\` — Show members
› \`${config.prefix}groupinfo\` — Group details
› \`${config.prefix}broadcast\` — Msg all groups
› \`${config.prefix}announce\` — Group announcement

━━━━━━━━━━━━━━━━━━━
🌐 *STATUS TOOLS*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}autoreactstatus\` — Auto react status
› \`${config.prefix}autoviewstatus\` — Auto view status
› \`${config.prefix}autoread\` — Mark msgs as read
› \`${config.prefix}autotyping\` — Show typing indicator
› \`${config.prefix}autoonline\` — Stay always online

━━━━━━━━━━━━━━━━━━━
🎭 *STICKER & MEDIA*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}sticker\` — Image to sticker
› \`${config.prefix}toimage\` — Sticker to image
› \`${config.prefix}steal\` — Clone reply sticker
› \`${config.prefix}blur\` — Blur an image
› \`${config.prefix}enhance\` — Enhance image
› \`${config.prefix}emojimix\` — Mix two emojis
› \`${config.prefix}getpp\` — Get profile picture

━━━━━━━━━━━━━━━━━━━
📥 *DOWNLOADERS*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}ytmp3\` — YouTube to MP3
› \`${config.prefix}ytmp4\` — YouTube to MP4
› \`${config.prefix}instagram\` — Instagram media
› \`${config.prefix}tiktok\` — TikTok video
› \`${config.prefix}facebook\` — Facebook video
› \`${config.prefix}twitter\` — Twitter media
› \`${config.prefix}lyrics\` — Song lyrics

━━━━━━━━━━━━━━━━━━━
🎰 *FUN & GAMES*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}joke\` — Random joke
› \`${config.prefix}fact\` — Random fact
› \`${config.prefix}riddle\` — Brain teaser
› \`${config.prefix}advice\` — Life advice
› \`${config.prefix}motivate\` — Motivation quote
› \`${config.prefix}compliment\` — Compliment someone
› \`${config.prefix}insult\` — Fun roast @user
› \`${config.prefix}8ball\` — Ask magic 8 ball
› \`${config.prefix}coinflip\` — Heads or tails
› \`${config.prefix}dice\` — Roll a dice

━━━━━━━━━━━━━━━━━━━
🔧 *UTILITIES*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}tts\` — Text to speech
› \`${config.prefix}translate\` — Translate text
› \`${config.prefix}weather\` — Weather info
› \`${config.prefix}calculate\` — Calculator
› \`${config.prefix}bible\` — Bible verse
› \`${config.prefix}quote\` — Inspirational quote
› \`${config.prefix}fake\` — Generate fake profile
› \`${config.prefix}whois\` @user — User info
› \`${config.prefix}setpp\` — Set bot profile pic

━━━━━━━━━━━━━━━━━━━
ℹ️ *BOT INFO*
━━━━━━━━━━━━━━━━━━━
› \`${config.prefix}menu\` — This menu
› \`${config.prefix}alive\` — Bot status
› \`${config.prefix}ping\` — Response speed
› \`${config.prefix}owner\` — Contact owner
› \`${config.prefix}report\` — Report a bug
› \`${config.prefix}delete\` — Delete bot msg

━━━━━━━━━━━━━━━━━━━
_Killer_XD Bot · Signature: ${config.signature}_
`
  await sock.sendMessage(jid, { text: menuText.trim() }, { quoted: msg })
}

const alive = async ({ sock, msg, jid }) => {
  const uptime = process.uptime()
  const h = Math.floor(uptime / 3600)
  const m = Math.floor((uptime % 3600) / 60)
  const s = Math.floor(uptime % 60)
  const text = `
╔══════════════════════╗
║  ⚡ *KILLER_XD BOT*  ║
╚══════════════════════╝

🟢 *Status:* Fully Operational
⏱️ *Uptime:* ${h}h ${m}m ${s}s
🧠 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB
📡 *Channels:* Auto-joined ✅
✍️ *Signature:* ${config.signature}
🔧 *Commands:* 60 active

_Bot is alive and running! 🔥_
  `.trim()
  await sock.sendMessage(jid, { text }, { quoted: msg })
}

const ping = async ({ sock, msg, jid }) => {
  const start = Date.now()
  const sentMsg = await sock.sendMessage(jid, { text: '📡 *Pinging...*' }, { quoted: msg })
  const end = Date.now()
  await sock.sendMessage(jid, {
    text: `⚡ *Pong!*\n\n🏓 *Response Time:* ${end - start}ms\n📶 *Connection:* Stable\n✅ *Status:* Online`,
    edit: sentMsg.key,
  })
}

const owner = async ({ sock, msg, jid }) => {
  const text = `
👑 *BOT OWNER INFO*

📛 *Name:* ${config.signature}
🤖 *Bot:* Killer_XD
📱 *Contact:* wa.me/${config.owner[0]}
📣 *Channels:* Auto-joined

_Reach out to the owner for support, partnerships, or custom bots._
  `.trim()
  await sock.sendMessage(jid, { text }, { quoted: msg })
}

const report = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .report <your issue here>' }, { quoted: msg })
  const issue = args.join(' ')
  await sock.sendMessage(jid, {
    text: `✅ *Report Submitted!*\n\n📋 *Issue:* ${issue}\n\n_Your report has been forwarded to the owner (${config.signature}). Thank you!_`,
  }, { quoted: msg })
  // Forward to owner
  try {
    await sock.sendMessage(config.owner[0] + '@s.whatsapp.net', {
      text: `🚨 *NEW BUG REPORT*\n\n📋 *Issue:* ${issue}\n📍 *From:* ${jid}`,
    })
  } catch {}
}

module.exports = { menu, alive, ping, owner, report }
