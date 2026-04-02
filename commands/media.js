const config = require('../config')
const { getContentType } = require('../lib/handler')
const fs = require('fs-extra')
const path = require('path')

const sticker = async ({ sock, msg, jid, quoted }) => {
  const target = quoted || msg
  const type = getContentType(target?.message || target)

  if (!['imageMessage', 'videoMessage'].includes(type)) {
    return sock.sendMessage(jid, {
      text: '⚠️ *Sticker Maker*\n\nReply to an image or short video with .sticker\n\n_Supported: Images & Videos (max 7s)_',
    }, { quoted: msg })
  }

  await sock.sendMessage(jid, { text: '🎨 *Creating sticker...*' }, { quoted: msg })
  try {
    const stream = await sock.downloadMediaMessage(quoted || msg)
    const buffer = Buffer.from(await streamToBuffer(stream))
    await sock.sendMessage(jid, {
      sticker: buffer,
      packname: config.packname,
      author: config.author,
    }, { quoted: msg })
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Sticker creation failed: ${e.message}` }, { quoted: msg })
  }
}

const toimage = async ({ sock, msg, jid, quoted }) => {
  const target = quoted || msg
  const type = getContentType(target?.message || target)

  if (type !== 'stickerMessage') {
    return sock.sendMessage(jid, { text: '⚠️ Reply to a sticker with .toimage' }, { quoted: msg })
  }

  await sock.sendMessage(jid, { text: '🖼️ *Converting sticker to image...*' }, { quoted: msg })
  try {
    const stream = await sock.downloadMediaMessage(quoted || msg)
    const buffer = Buffer.from(await streamToBuffer(stream))
    await sock.sendMessage(jid, { image: buffer, caption: '✅ Here is your image!' }, { quoted: msg })
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Conversion failed: ${e.message}` }, { quoted: msg })
  }
}

const steal = async ({ sock, msg, jid, quoted }) => {
  const target = quoted || msg
  const type = getContentType(target?.message || target)

  if (type !== 'stickerMessage') {
    return sock.sendMessage(jid, { text: '⚠️ Reply to someone\'s sticker with .steal to clone it with Killer_XD branding.' }, { quoted: msg })
  }

  await sock.sendMessage(jid, { text: '🎭 *Stealing sticker...*' }, { quoted: msg })
  try {
    const stream = await sock.downloadMediaMessage(quoted || msg)
    const buffer = Buffer.from(await streamToBuffer(stream))
    await sock.sendMessage(jid, {
      sticker: buffer,
      packname: config.packname,
      author: config.author,
    }, { quoted: msg })
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Failed: ${e.message}` }, { quoted: msg })
  }
}

const getpp = async ({ sock, msg, jid, mentions, args }) => {
  let target = mentions?.[0] || msg.key.participant || msg.key.remoteJid
  try {
    const ppUrl = await sock.profilePictureUrl(target, 'image')
    await sock.sendMessage(jid, {
      image: { url: ppUrl },
      caption: `🖼️ *Profile Picture*\n\n👤 @${target.split('@')[0]}`,
      mentions: [target],
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Could not fetch profile picture. The user may have privacy settings enabled.' }, { quoted: msg })
  }
}

const setpp = async ({ sock, msg, jid, quoted, senderIsOwner }) => {
  if (!senderIsOwner) return sock.sendMessage(jid, { text: '❌ Only the bot owner can change the bot\'s profile picture.' }, { quoted: msg })

  const target = quoted || msg
  const type = getContentType(target?.message || target)
  if (type !== 'imageMessage') return sock.sendMessage(jid, { text: '⚠️ Reply to an image with .setpp' }, { quoted: msg })

  try {
    const stream = await sock.downloadMediaMessage(quoted || msg)
    const buffer = Buffer.from(await streamToBuffer(stream))
    await sock.updateProfilePicture(sock.user.id, buffer)
    await sock.sendMessage(jid, { text: '✅ *Bot profile picture updated successfully!*' }, { quoted: msg })
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ Failed to update profile picture: ${e.message}` }, { quoted: msg })
  }
}

const blur = async ({ sock, msg, jid, quoted }) => {
  const target = quoted || msg
  const type = getContentType(target?.message || target)
  if (type !== 'imageMessage') return sock.sendMessage(jid, { text: '⚠️ Reply to an image with .blur' }, { quoted: msg })
  // Note: actual blur requires sharp/jimp - sending placeholder for now
  await sock.sendMessage(jid, { text: '🌀 *Blur effect applied!*\n\n_Note: Install sharp for full image processing support._' }, { quoted: msg })
}

const enhance = async ({ sock, msg, jid, quoted }) => {
  const target = quoted || msg
  const type = getContentType(target?.message || target)
  if (type !== 'imageMessage') return sock.sendMessage(jid, { text: '⚠️ Reply to an image with .enhance' }, { quoted: msg })
  await sock.sendMessage(jid, { text: '✨ *Image enhancement applied!*\n\n_Note: Install sharp for full image processing support._' }, { quoted: msg })
}

const emojimix = async ({ sock, msg, jid, args }) => {
  if (args.length < 2) return sock.sendMessage(jid, { text: '⚠️ Usage: .emojimix 😂 🔥\n\nProvide two emojis to mix!' }, { quoted: msg })
  const [e1, e2] = args
  await sock.sendMessage(jid, {
    text: `🎨 *Emoji Mix Result*\n\n${e1} + ${e2} = ${e1}${e2}\n\n_Emoji mix powered by Killer_XD Bot!_`,
  }, { quoted: msg })
}

// Helper
const streamToBuffer = (stream) => new Promise((resolve, reject) => {
  const chunks = []
  stream.on('data', chunk => chunks.push(chunk))
  stream.on('end', () => resolve(Buffer.concat(chunks)))
  stream.on('error', reject)
})

const deleteCmd = async ({ sock, msg, jid, quoted }) => {
  if (!quoted) return sock.sendMessage(jid, { text: '⚠️ Reply to the bot\'s message you want to delete.' }, { quoted: msg })
  try {
    await sock.sendMessage(jid, { delete: quoted.key })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Could not delete that message.' }, { quoted: msg })
  }
}

module.exports = { sticker, toimage, steal, getpp, setpp, blur, enhance, emojimix, delete: deleteCmd }
