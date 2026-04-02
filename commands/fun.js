const config = require('../config')

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high. She looked surprised. 😆",
  "Why do cows wear bells? Because their horns don't work! 🐄",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why can't you give Elsa a balloon? She'll let it go! ❄️",
  "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "What do you call cheese that isn't yours? Nacho cheese! 🧀",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "I used to hate facial hair but then it grew on me! 😂",
]

const facts = [
  "🌍 A day on Venus is longer than a year on Venus!",
  "🐘 Elephants are the only animals that can't jump!",
  "🍯 Honey never expires. Archaeologists found 3000-year-old honey in Egyptian tombs!",
  "🦈 Sharks are older than trees. They've existed for over 400 million years!",
  "🌙 The moon is drifting away from Earth at 3.8cm per year.",
  "🐙 An octopus has three hearts and blue blood!",
  "☀️ The Sun makes up 99.86% of the Solar System's total mass.",
  "🧠 Your brain generates about 20 watts of electricity — enough to power a light bulb!",
  "🦋 Butterflies taste with their feet!",
  "🐟 Clownfish can change their gender. All clownfish are born male!",
]

const riddles = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? 🌬️", a: "An Echo!" },
  { q: "The more you take, the more you leave behind. What am I? 👣", a: "Footsteps!" },
  { q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I? 🗺️", a: "A Map!" },
  { q: "What has hands but can't clap? ⏰", a: "A Clock!" },
  { q: "What gets wetter as it dries? 🧻", a: "A Towel!" },
]

const motivations = [
  "💪 *\"The secret of getting ahead is getting started.\"* — Mark Twain",
  "🚀 *\"You don't have to be great to start, but you have to start to be great.\"* — Zig Ziglar",
  "🌟 *\"Believe you can and you're halfway there.\"* — Theodore Roosevelt",
  "🔥 *\"It does not matter how slowly you go as long as you do not stop.\"* — Confucius",
  "⚡ *\"Push yourself, because no one else is going to do it for you.\"*",
  "🏆 *\"Success is not final, failure is not fatal: it is the courage to continue that counts.\"* — Churchill",
  "🌈 *\"Dream big and dare to fail.\"* — Norman Vaughan",
  "💡 *\"The only way to do great work is to love what you do.\"* — Steve Jobs",
]

const compliments = [
  "You light up every room you walk into! ✨",
  "You have the best laugh and it's contagious! 😄",
  "You're more fun than bubble wrap! 🫧",
  "You make the world a better place just by being in it! 🌍",
  "Your smile could cure a bad day! 😊",
  "You're an absolute legend! 🏆",
  "You radiate good vibes! 🌟",
  "You're proof that awesome things can happen! ⚡",
]

const insults = [
  "You're so bright, your parents call you 'son/daughter'! 😂",
  "I'd call you a tool, but they're actually useful! 🔧😂",
  "You have your entire life to be a dumbass. Why not take today off? 😂",
  "I'm not insulting you, I'm describing you! 😆",
  "You're like a software update — whenever I see you, I think 'not now' 😂",
]

const advices = [
  "🧠 *Drink more water.* Your body is 60% water — hydration is key to everything.",
  "😴 *Sleep 7-9 hours.* Your brain literally cleans itself while you sleep!",
  "📵 *Put your phone down* 30 minutes before bed. Blue light kills melatonin.",
  "🚶 *Walk every day.* Even 20 minutes improves mood, memory, and health.",
  "📖 *Read something new daily.* Knowledge is the one thing no one can take from you.",
  "🙏 *Practice gratitude.* Write 3 things you're thankful for every morning.",
]

const eightBallResponses = [
  "🎱 *It is certain!*",
  "🎱 *Without a doubt!*",
  "🎱 *Yes, definitely!*",
  "🎱 *You may rely on it.*",
  "🎱 *As I see it, yes.*",
  "🎱 *Most likely.*",
  "🎱 *Outlook good.*",
  "🎱 *Signs point to yes.*",
  "🎱 *Reply hazy, try again.*",
  "🎱 *Ask again later.*",
  "🎱 *Better not tell you now.*",
  "🎱 *Cannot predict now.*",
  "🎱 *Don't count on it.*",
  "🎱 *My reply is no.*",
  "🎱 *My sources say no.*",
  "🎱 *Outlook not so good.*",
  "🎱 *Very doubtful.*",
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

const joke = async ({ sock, msg, jid }) => {
  await sock.sendMessage(jid, {
    text: `😂 *Random Joke*\n\n${rand(jokes)}\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const fact = async ({ sock, msg, jid }) => {
  await sock.sendMessage(jid, {
    text: `🧠 *Did You Know?*\n\n${rand(facts)}\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const riddle = async ({ sock, msg, jid }) => {
  const r = rand(riddles)
  await sock.sendMessage(jid, {
    text: `🧩 *Brain Teaser!*\n\n❓ ${r.q}\n\n||Tap to reveal: ${r.a}||`,
  }, { quoted: msg })
}

const advice = async ({ sock, msg, jid }) => {
  await sock.sendMessage(jid, {
    text: `💡 *Life Advice*\n\n${rand(advices)}\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const motivate = async ({ sock, msg, jid }) => {
  await sock.sendMessage(jid, {
    text: `🔥 *Motivation of the Moment*\n\n${rand(motivations)}\n\n_Keep pushing! — Killer_XD Bot_`,
  }, { quoted: msg })
}

const compliment = async ({ sock, msg, jid, mentions, sender }) => {
  const target = mentions?.[0] || sender
  await sock.sendMessage(jid, {
    text: `💖 *Compliment*\n\n@${target.split('@')[0]}, ${rand(compliments)}\n\n_— Killer_XD Bot_`,
    mentions: [target],
  }, { quoted: msg })
}

const insult = async ({ sock, msg, jid, mentions, sender }) => {
  const target = mentions?.[0] || sender
  await sock.sendMessage(jid, {
    text: `😂 *Fun Roast*\n\n@${target.split('@')[0]}, ${rand(insults)}\n\n_All in good fun! — Killer_XD Bot_`,
    mentions: [target],
  }, { quoted: msg })
}

const eightball = async ({ sock, msg, jid, args }) => {
  if (!args.length) return sock.sendMessage(jid, { text: '⚠️ Ask me a yes/no question!\n\nUsage: .8ball Will I pass my exams?' }, { quoted: msg })
  const question = args.join(' ')
  await sock.sendMessage(jid, {
    text: `🎱 *Magic 8-Ball*\n\n❓ *Question:* ${question}\n\n${rand(eightBallResponses)}\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const coinflip = async ({ sock, msg, jid }) => {
  const result = Math.random() < 0.5 ? '🪙 *HEADS!*' : '🔵 *TAILS!*'
  await sock.sendMessage(jid, {
    text: `🪙 *Coin Flip*\n\n${result}\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

const dice = async ({ sock, msg, jid }) => {
  const roll = Math.floor(Math.random() * 6) + 1
  const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  await sock.sendMessage(jid, {
    text: `🎲 *Dice Roll*\n\n${faces[roll]} You rolled a *${roll}*!\n\n_— Killer_XD Bot_`,
  }, { quoted: msg })
}

module.exports = { joke, fact, riddle, advice, motivate, compliment, insult, '8ball': eightball, coinflip, dice }
