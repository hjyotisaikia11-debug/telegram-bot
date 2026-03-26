process.on('uncaughtException', (err) => {
  console.log('Error:', err);
});

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.log("BOT_TOKEN missing");
  process.exit(1);
}

const ADMIN_ID = 1342806336; // apna Telegram numeric ID daalo
const app = express();
app.use(express.json());

const bot = new TelegramBot(TOKEN);
const users = {};

function menu() {
  return {
    reply_markup: {
      keyboard: [["🟢 START", "🔴 STOP"]],
      resize_keyboard: true
    }
  };
}

bot.onText(/\/start/, (msg) => {
  const id = String(msg.chat.id);
  users[id] = users[id] || { verified: false, active: false };

  bot.sendMessage(
    id,
    `Welcome\n\nRegister On This Link 
    
    https://www.trivandrum91.com/#/register?invitationCode=85821434737 
    
    Apna ID ya message bhejo verification ke liye.`,
    menu()
  );
});

bot.onText(/\/approve (\d+)/, (msg, match) => {
  if (String(msg.chat.id) !== String(ADMIN_ID)) return;

  const userId = String(match[1]);
  users[userId] = users[userId] || { verified: false, active: false };
  users[userId].verified = true;
  users[userId].active = true;

  bot.sendMessage(userId, "✅ Verified", menu());
});

bot.onText(/\/reject (\d+)/, (msg, match) => {
  if (String(msg.chat.id) !== String(ADMIN_ID)) return;

  const userId = String(match[1]);
  bot.sendMessage(userId, "❌ Verification failed");
});

bot.on("message", (msg) => {
  const id = String(msg.chat.id);
  const text = msg.text;

  if (!users[id]) return;
  if (!text) return;
  if (text.startsWith("/")) return;

  if (!users[id].verified) {
    bot.sendMessage(
      ADMIN_ID,
      `Verification Request\n\nUser ID: ${id}\nMessage: ${text}\n\n/approve ${id}\n/reject ${id}`
    );
    bot.sendMessage(id, "⏳ Verification pending...");
    return;
  }

  if (text === "🟢 START") {
    users[id].active = true;
    bot.sendMessage(id, "▶️ Notifications ON", menu());
    return;
  }

  if (text === "🔴 STOP") {
    users[id].active = false;
    bot.sendMessage(id, "🛑 Notifications OFF", menu());
  }
});

setInterval(() => {
  Object.keys(users).forEach((id) => {
    if (users[id].verified && users[id].active) {
      bot.sendMessage(id, "⏰ Auto message from bot");
    }
  });
}, 60000);

app.get("/", (req, res) => {
  res.status(200).send("Bot is running");
});

app.post(`/bot${TOKEN}`, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.log("Webhook error:", e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
    if (domain) {
      const url = `https://${domain}/bot${TOKEN}`;
      await bot.setWebHook(url);
      console.log("✅ Webhook set:", url);
    } else {
      console.log("⚠️ RAILWAY_PUBLIC_DOMAIN not found");
    }
  } catch (e) {
    console.log("Webhook set failed:", e.message);
  }
});
