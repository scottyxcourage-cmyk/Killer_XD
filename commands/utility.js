const config = require('../config')
const axios = require('axios')

const calculate = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .calculate 5 * 8 + 3' }, { quoted: msg })
  const expr = args.join(' ')
  try {
    // Safe math eval using Function constructor with limited scope
    const result = Function('"use strict"; return (' + expr.replace(/[^0-9+\-*/().% ]/g, '') + ')')()
    if (isNaN(result) || !isFinite(result)) throw new Error('Invalid expression')
    await sock.sendMessage(jid, {
      text: `🧮 *Calculator*\n\n📥 *Input:* \`${expr}\`\n📤 *Result:* \`${result}\`\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Invalid math expression. Try: .calculate 5 * 8 + 3' }, { quoted: msg })
  }
}

const weather = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .weather Nairobi' }, { quoted: msg })
  const city = args.join(' ')
  try {
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 8000 })
    const data = res.data
    const current = data.current_condition[0]
    const area = data.nearest_area[0]
    const cityName = area.areaName[0].value
    const country = area.country[0].value
    const temp = current.temp_C
    const feelsLike = current.FeelsLikeC
    const humidity = current.humidity
    const windspeed = current.windspeedKmph
    const desc = current.weatherDesc[0].value

    await sock.sendMessage(jid, {
      text: `
🌤️ *Weather Report*

📍 *Location:* ${cityName}, ${country}
🌡️ *Temperature:* ${temp}°C (Feels like ${feelsLike}°C)
💧 *Humidity:* ${humidity}%
💨 *Wind Speed:* ${windspeed} km/h
🌥️ *Condition:* ${desc}

_— Killer_XD Bot_
      `.trim(),
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: `❌ Could not get weather for "${city}". Check the city name and try again.` }, { quoted: msg })
  }
}

const translate = async ({ sock, msg, jid, args }) => {
  if (args.length < 2) return sock.sendMessage(jid, { text: '⚠️ Usage: .translate fr Hello world\n\nLanguage codes: en, fr, es, de, ar, sw, pt, zh, ja, hi...' }, { quoted: msg })
  const [lang, ...textArr] = args
  const text = textArr.join(' ')
  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`,
      { timeout: 8000 }
    )
    const translated = res.data.responseData.translatedText
    await sock.sendMessage(jid, {
      text: `🌐 *Translation*\n\n📝 *Original:* ${text}\n🔁 *Translated (${lang}):* ${translated}\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Translation failed. Check language code and try again.' }, { quoted: msg })
  }
}

const tts = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .tts Hello, this is a test message' }, { quoted: msg })
  const text = args.join(' ')
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    await sock.sendMessage(jid, {
      audio: Buffer.from(res.data),
      mimetype: 'audio/mpeg',
      ptt: true,
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ TTS failed. Please try a shorter text or check your connection.' }, { quoted: msg })
  }
}

const lyrics = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .lyrics Shape of You Ed Sheeran' }, { quoted: msg })
  const query = args.join(' ')
  try {
    const res = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`, { timeout: 8000 })
    const data = res.data
    if (!data.lyrics) throw new Error('Not found')
    const truncated = data.lyrics.length > 3000 ? data.lyrics.slice(0, 3000) + '\n...[truncated]' : data.lyrics
    await sock.sendMessage(jid, {
      text: `🎵 *Lyrics: ${data.title}*\n🎤 *Artist:* ${data.author}\n\n${truncated}\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: `❌ Lyrics not found for "${query}". Try a different song title.` }, { quoted: msg })
  }
}

const bible = async ({ sock, msg, jid, args }) => {
  try {
    let url
    if (args.length) {
      // Specific verse e.g. John 3:16
      const verse = args.join(' ')
      url = `https://bible-api.com/${encodeURIComponent(verse)}`
    } else {
      // Random verse
      url = 'https://bible-api.com/?random=verse'
    }
    const res = await axios.get(url, { timeout: 8000 })
    const data = res.data
    await sock.sendMessage(jid, {
      text: `✝️ *Bible Verse*\n\n📖 *${data.reference}*\n\n_"${data.text.trim()}"_\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Could not fetch Bible verse. Try: .bible John 3:16' }, { quoted: msg })
  }
}

const quote = async ({ sock, msg, jid }) => {
  try {
    const res = await axios.get('https://api.quotable.io/random', { timeout: 8000 })
    const data = res.data
    await sock.sendMessage(jid, {
      text: `💬 *Quote of the Moment*\n\n_"${data.content}"_\n\n— *${data.author}*\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  } catch {
    const fallback = [
      '"The only way to do great work is to love what you do." — Steve Jobs',
      '"In the middle of every difficulty lies opportunity." — Einstein',
      '"It always seems impossible until it is done." — Mandela',
    ]
    await sock.sendMessage(jid, {
      text: `💬 *Quote of the Moment*\n\n_${fallback[Math.floor(Math.random() * fallback.length)]}_\n\n_— Killer_XD Bot_`,
    }, { quoted: msg })
  }
}

const fake = async ({ sock, msg, jid }) => {
  try {
    const res = await axios.get('https://randomuser.me/api/', { timeout: 8000 })
    const u = res.data.results[0]
    const text = `
🎭 *Fake Profile Generator*

👤 *Name:* ${u.name.first} ${u.name.last}
🚻 *Gender:* ${u.gender}
🎂 *Age:* ${u.dob.age}
📍 *Location:* ${u.location.city}, ${u.location.country}
📧 *Email:* ${u.email}
📱 *Phone:* ${u.phone}
🏢 *Username:* ${u.login.username}
🗓️ *DOB:* ${new Date(u.dob.date).toLocaleDateString()}

⚠️ _This is 100% fake data for fun only!_
_— Killer_XD Bot_
    `.trim()
    await sock.sendMessage(jid, { text }, { quoted: msg })
  } catch {
    await sock.sendMessage(jid, { text: '❌ Could not generate fake profile right now. Try again!' }, { quoted: msg })
  }
}

const whois = async ({ sock, msg, jid, mentions, sender }) => {
  const target = mentions?.[0] || sender
  let pp = '❌ No profile picture'
  try {
    pp = await sock.profilePictureUrl(target, 'image')
    pp = '✅ Has profile picture'
  } catch {}

  const num = target.split('@')[0]
  await sock.sendMessage(jid, {
    text: `
👤 *User Info*

📱 *Number:* +${num}
🆔 *JID:* ${target}
🖼️ *Profile Pic:* ${pp}
🤖 *Bot:* ${target === sock.user?.id ? 'Yes (That\'s me!)' : 'No'}

_— Killer_XD Bot_
    `.trim(),
    mentions: [target],
  }, { quoted: msg })
}

const ytmp3 = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .ytmp3 <YouTube URL>' }, { quoted: msg })
  await sock.sendMessage(jid, {
    text: `🎵 *YouTube MP3 Downloader*\n\n🔗 URL: ${args[0]}\n\n⚠️ _YouTube audio downloading requires a paid API key. Please configure YTDL_API_KEY in your .env file._\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const ytmp4 = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .ytmp4 <YouTube URL>' }, { quoted: msg })
  await sock.sendMessage(jid, {
    text: `🎥 *YouTube MP4 Downloader*\n\n🔗 URL: ${args[0]}\n\n⚠️ _YouTube video downloading requires a paid API key. Please configure YTDL_API_KEY in your .env file._\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const instagram = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .instagram <Instagram URL>' }, { quoted: msg })
  await sock.sendMessage(jid, {
    text: `📸 *Instagram Downloader*\n\n🔗 URL: ${args[0]}\n\n⚠️ _Instagram downloading requires API configuration. Set INSTA_API_KEY in .env_\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const tiktok = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .tiktok <TikTok URL>' }, { quoted: msg })
  try {
    const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(args[0])}`, { timeout: 10000 })
    const data = res.data
    if (data?.video?.noWatermark) {
      await sock.sendMessage(jid, {
        video: { url: data.video.noWatermark },
        caption: `✅ *TikTok Video Downloaded!*\n\n📝 ${data.title || ''}\n\n_— Killer_XD Bot_`,
        gifPlayback: false,
      }, { quoted: msg })
    } else throw new Error()
  } catch {
    await sock.sendMessage(jid, { text: `❌ Could not download TikTok video. Make sure the link is valid and the video is public.` }, { quoted: msg })
  }
}

const facebook = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .facebook <Facebook video URL>' }, { quoted: msg })
  await sock.sendMessage(jid, {
    text: `📘 *Facebook Downloader*\n\n🔗 URL: ${args[0]}\n\n⚠️ _Facebook video downloading requires API configuration. Set FB_API_KEY in .env_\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const twitter = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Usage: .twitter <Twitter/X URL>' }, { quoted: msg })
  await sock.sendMessage(jid, {
    text: `🐦 *Twitter/X Downloader*\n\n🔗 URL: ${args[0]}\n\n⚠️ _Twitter video downloading requires API configuration. Set TWITTER_API_KEY in .env_\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

module.exports = {
  calculate, weather, translate, tts, lyrics, bible,
  quote, fake, whois, ytmp3, ytmp4, instagram, tiktok, facebook, twitter
}
