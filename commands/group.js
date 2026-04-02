const config = require('../config')
const { isAdmin, isBotAdmin, getMentionList } = require('../lib/handler')

const antidelete = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })

  if (config.antiDeleteGroups.has(jid)) {
    config.antiDeleteGroups.delete(jid)
    await sock.sendMessage(jid, { text: '🗑️ *Anti-Delete DISABLED*\n\nDeleted messages will no longer be restored.' }, { quoted: msg })
  } else {
    config.antiDeleteGroups.add(jid)
    await sock.sendMessage(jid, { text: '🛡️ *Anti-Delete ENABLED*\n\nAll deleted messages in this group will be automatically restored by Killer_XD! 👀' }, { quoted: msg })
  }
}

const antilink = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })

  if (config.antiLinkGroups.has(jid)) {
    config.antiLinkGroups.delete(jid)
    await sock.sendMessage(jid, { text: '🔗 *Anti-Link DISABLED*\n\nGroup links are now allowed.' }, { quoted: msg })
  } else {
    config.antiLinkGroups.add(jid)
    await sock.sendMessage(jid, { text: '🚫 *Anti-Link ENABLED*\n\nAny member who sends group invite links will be automatically kicked! ⚡' }, { quoted: msg })
  }
}

const welcome = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })

  if (config.welcomeGroups.has(jid)) {
    config.welcomeGroups.delete(jid)
    await sock.sendMessage(jid, { text: '👋 *Welcome Messages DISABLED*' }, { quoted: msg })
  } else {
    config.welcomeGroups.add(jid)
    await sock.sendMessage(jid, { text: '🎉 *Welcome Messages ENABLED*\n\nNew members will be greeted automatically!' }, { quoted: msg })
  }
}

const goodbye = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })

  if (config.goodbyeGroups.has(jid)) {
    config.goodbyeGroups.delete(jid)
    await sock.sendMessage(jid, { text: '🚪 *Goodbye Messages DISABLED*' }, { quoted: msg })
  } else {
    config.goodbyeGroups.add(jid)
    await sock.sendMessage(jid, { text: '🚪 *Goodbye Messages ENABLED*\n\nMembers who leave will get a farewell message!' }, { quoted: msg })
  }
}

const tagall = async ({ sock, msg, jid, isGroup, senderIsAdmin, args }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })

  const meta = await sock.groupMetadata(jid)
  const members = meta.participants
  const mentions = getMentionList(members)
  const customMsg = args.join(' ') || '📢 Attention everyone!'
  const text = `📣 *${customMsg}*\n\n${members.map((m, i) => `${i + 1}. @${m.id.split('@')[0]}`).join('\n')}`
  await sock.sendMessage(jid, { text, mentions }, { quoted: msg })
}

const kick = async ({ sock, msg, jid, isGroup, senderIsAdmin, mentions }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })
  if (!(await isBotAdmin(jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to kick members.' }, { quoted: msg })

  const target = mentions?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant
  if (!target) return sock.sendMessage(jid, { text: '⚠️ Please mention or reply to the user to kick.\n\nUsage: .kick @user' }, { quoted: msg })

  await sock.groupParticipantsUpdate(jid, [target], 'remove')
  await sock.sendMessage(jid, {
    text: `👢 *Member Removed*\n\n@${target.split('@')[0]} has been kicked from the group.`,
    mentions: [target],
  }, { quoted: msg })
}

const promote = async ({ sock, msg, jid, isGroup, senderIsAdmin, mentions }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })
  if (!(await isBotAdmin(jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to promote members.' }, { quoted: msg })

  const target = mentions?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant
  if (!target) return sock.sendMessage(jid, { text: '⚠️ Usage: .promote @user' }, { quoted: msg })

  await sock.groupParticipantsUpdate(jid, [target], 'promote')
  await sock.sendMessage(jid, {
    text: `⭐ *Promotion*\n\n@${target.split('@')[0]} is now a group admin! Congratulations! 🎉`,
    mentions: [target],
  }, { quoted: msg })
}

const demote = async ({ sock, msg, jid, isGroup, senderIsAdmin, mentions }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })
  if (!(await isBotAdmin(jid))) return sock.sendMessage(jid, { text: '❌ I need to be an admin to demote members.' }, { quoted: msg })

  const target = mentions?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant
  if (!target) return sock.sendMessage(jid, { text: '⚠️ Usage: .demote @user' }, { quoted: msg })

  await sock.groupParticipantsUpdate(jid, [target], 'demote')
  await sock.sendMessage(jid, {
    text: `🔻 *Demotion*\n\n@${target.split('@')[0]} has been removed from admin. 📉`,
    mentions: [target],
  }, { quoted: msg })
}

const mute = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })
  if (!(await isBotAdmin(jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights to mute the group.' }, { quoted: msg })

  await sock.groupSettingUpdate(jid, 'announcement')
  await sock.sendMessage(jid, { text: '🔇 *Group Muted*\n\nOnly admins can send messages now.' }, { quoted: msg })
}

const unmute = async ({ sock, msg, jid, isGroup, senderIsAdmin }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only group admins can use this.' }, { quoted: msg })
  if (!(await isBotAdmin(jid))) return sock.sendMessage(jid, { text: '❌ I need admin rights to unmute the group.' }, { quoted: msg })

  await sock.groupSettingUpdate(jid, 'not_announcement')
  await sock.sendMessage(jid, { text: '🔊 *Group Unmuted*\n\nEveryone can send messages again!' }, { quoted: msg })
}

const listadmins = async ({ sock, msg, jid, isGroup }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })

  const meta = await sock.groupMetadata(jid)
  const admins = meta.participants.filter(p => p.admin)
  const mentions = getMentionList(admins)
  const text = `👑 *Group Admins (${admins.length})*\n\n${admins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]} ${a.admin === 'superadmin' ? '👑 Owner' : '⭐ Admin'}`).join('\n')}`
  await sock.sendMessage(jid, { text, mentions }, { quoted: msg })
}

const listmembers = async ({ sock, msg, jid, isGroup }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })

  const meta = await sock.groupMetadata(jid)
  const members = meta.participants
  const mentions = getMentionList(members)
  const text = `👥 *Group Members (${members.length})*\n\n${members.map((m, i) => `${i + 1}. @${m.id.split('@')[0]}${m.admin ? ' ⭐' : ''}`).join('\n')}`
  await sock.sendMessage(jid, { text, mentions }, { quoted: msg })
}

const groupinfo = async ({ sock, msg, jid, isGroup }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })

  const meta = await sock.groupMetadata(jid)
  const admins = meta.participants.filter(p => p.admin).length
  const text = `
📋 *GROUP INFORMATION*

🏷️ *Name:* ${meta.subject}
🆔 *ID:* ${jid.split('@')[0]}
👥 *Members:* ${meta.participants.length}
⭐ *Admins:* ${admins}
📝 *Description:* ${meta.desc || 'No description'}
🔒 *Restricted:* ${meta.announce ? 'Yes (only admins can send)' : 'No'}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}
  `.trim()
  await sock.sendMessage(jid, { text }, { quoted: msg })
}

const broadcast = async ({ sock, msg, jid, senderIsOwner, args }) => {
  if (!senderIsOwner) return sock.sendMessage(jid, { text: '❌ Only the bot owner can broadcast.' }, { quoted: msg })
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .broadcast <message>' }, { quoted: msg })

  const broadcastMsg = args.join(' ')
  const groups = await sock.groupFetchAllParticipating()
  let sent = 0
  for (const g of Object.values(groups)) {
    try {
      await sock.sendMessage(g.id, { text: `📢 *BROADCAST from Killer_XD*\n\n${broadcastMsg}\n\n— ${config.signature}` })
      sent++
      await new Promise(r => setTimeout(r, 1000))
    } catch {}
  }
  await sock.sendMessage(jid, { text: `✅ Broadcast sent to ${sent} groups!` }, { quoted: msg })
}

const announce = async ({ sock, msg, jid, isGroup, senderIsAdmin, args }) => {
  if (!isGroup) return sock.sendMessage(jid, { text: '❌ This command works in groups only.' }, { quoted: msg })
  if (!senderIsAdmin) return sock.sendMessage(jid, { text: '❌ Only admins can make announcements.' }, { quoted: msg })
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .announce <message>' }, { quoted: msg })

  const announcement = args.join(' ')
  await sock.sendMessage(jid, {
    text: `📣 *ANNOUNCEMENT*\n\n${announcement}\n\n— ${config.signature}`,
  }, { quoted: msg })
}

module.exports = {
  antidelete, antilink, welcome, goodbye, tagall,
  kick, promote, demote, mute, unmute,
  listadmins, listmembers, groupinfo, broadcast, announce
}
