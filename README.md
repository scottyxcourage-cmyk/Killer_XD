# ⚡ KILLER_XD WhatsApp Bot

> **Signature:** Scotty | **Version:** 1.0.0 | **Commands:** 60

A powerful multi-user WhatsApp bot built on @malzmc/baileys with a web-based pairing portal, deployable on Render.com.

---

## 🚀 Quick Deploy to Render

1. **Upload this project** to a GitHub repository (include the `Baileys-master` folder from the zip)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` and configure everything
5. Click **Deploy**
6. Visit your Render URL → users enter their number → get pairing code → WhatsApp linked!

---

## 💻 Local Setup

```bash
# 1. Extract the Baileys zip into the project root
unzip Baileys-master.zip   # creates Baileys-master/ folder

# 2. Install dependencies
npm install

# 3. Start the bot
npm start

# 4. Open browser
open http://localhost:3000
```

---

## 🔧 Configuration (`config.js`)

| Setting | Default | Description |
|---------|---------|-------------|
| `botName` | Killer_XD | Bot display name |
| `prefix` | `.` | Command prefix |
| `owner` | `['254700000000']` | Your WhatsApp number |
| `signature` | Scotty | Bot signature |
| `channels` | 2 channels | Auto-joined on startup |
| `port` | 3000 | Web server port |

**Change the owner number** in `config.js`:
```js
owner: ['YOUR_NUMBER_HERE'],  // e.g. '254712345678'
```

---

## 📋 All 60 Commands

### 🛡️ Group Management (15)
| Command | Description |
|---------|-------------|
| `.antidelete` | Restore deleted messages |
| `.antilink` | Auto-kick link senders |
| `.welcome` | Enable welcome messages |
| `.goodbye` | Enable goodbye messages |
| `.tagall` | Mention all members |
| `.kick @user` | Remove a member |
| `.promote @user` | Make someone admin |
| `.demote @user` | Remove admin rights |
| `.mute` | Only admins can send |
| `.unmute` | Everyone can send |
| `.listadmins` | Show all admins |
| `.listmembers` | Show all members |
| `.groupinfo` | Group details |
| `.broadcast <msg>` | Message all groups (owner) |
| `.announce <msg>` | Group announcement |

### 🌐 Status Tools (5)
| Command | Description |
|---------|-------------|
| `.autoreactstatus` | Auto react to statuses |
| `.autoviewstatus` | Auto view statuses |
| `.autoread` | Auto-mark messages read |
| `.autotyping` | Show typing indicator |
| `.autoonline` | Always appear online |

### 🎭 Sticker & Media (8)
| Command | Description |
|---------|-------------|
| `.sticker` | Image/video → sticker |
| `.toimage` | Sticker → image |
| `.steal` | Clone sticker with your tag |
| `.blur` | Blur an image |
| `.enhance` | Enhance image quality |
| `.emojimix 😂 🔥` | Mix two emojis |
| `.getpp @user` | Get profile picture |
| `.setpp` | Set bot profile pic |

### 📥 Downloaders (7)
| Command | Description |
|---------|-------------|
| `.ytmp3 <url>` | YouTube audio |
| `.ytmp4 <url>` | YouTube video |
| `.instagram <url>` | Instagram media |
| `.tiktok <url>` | TikTok video |
| `.facebook <url>` | Facebook video |
| `.twitter <url>` | Twitter/X media |
| `.lyrics <song>` | Song lyrics |

### 🎰 Fun & Games (10)
| Command | Description |
|---------|-------------|
| `.joke` | Random joke |
| `.fact` | Random fact |
| `.riddle` | Brain teaser |
| `.advice` | Life advice |
| `.motivate` | Motivational quote |
| `.compliment @user` | Compliment someone |
| `.insult @user` | Fun roast |
| `.8ball <question>` | Magic 8-ball |
| `.coinflip` | Heads or tails |
| `.dice` | Roll a dice |

### 🔧 Utilities (10)
| Command | Description |
|---------|-------------|
| `.weather <city>` | Weather report |
| `.translate <lang> <text>` | Translate text |
| `.tts <text>` | Text to speech |
| `.calculate <expr>` | Calculator |
| `.bible [verse]` | Bible verse |
| `.quote` | Inspirational quote |
| `.fake` | Generate fake profile |
| `.whois @user` | User info |
| `.ytmp3` | YouTube MP3 |
| `.tiktok <url>` | TikTok downloader |

### ℹ️ Bot Info (5)
| Command | Description |
|---------|-------------|
| `.menu` | Full command menu |
| `.alive` | Bot status & uptime |
| `.ping` | Response speed |
| `.owner` | Contact owner |
| `.report <issue>` | Report a bug |
| `.delete` | Delete bot's message |

---

## 📡 Auto Channel Follow

On startup, the bot automatically follows:
- `120363406322987320@newsletter`
- `120363416932827122@newsletter`

---

## 🌍 Deploying for Multiple Users

This bot supports **multiple simultaneous users**. Each person who pairs via the web portal gets their own session folder in `./sessions/`. The bot runs one Express server that manages all sessions.

**Render Free Plan Notes:**
- Bot may sleep after 15 minutes of inactivity
- Use [UptimeRobot](https://uptimerobot.com) to ping `/status` every 5 minutes to keep it awake

---

_Killer_XD Bot · Signature: Scotty_
