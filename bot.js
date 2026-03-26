const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

const app = express();
app.use(express.json());

// BOT
const bot = new TelegramBot(TOKEN);

// ✅ TEST COMMAND
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot working!");
});

// 🔥 IMPORTANT WEBHOOK ROUTE (FAST RESPONSE)
app.post(`/bot${TOKEN}`, (req, res) => {
  res.sendStatus(200); // 🔥 FIRST RESPONSE

  try {
    bot.processUpdate(req.body);
  } catch (e) {
    console.log("Update error:", e);
  }
});

// ROOT
app.get("/", (req, res) => {
  res.send("Bot is running");
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log("🚀 Server running on port " + PORT);

  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;

  if (domain) {
    const url = `https://${domain}/bot${TOKEN}`;
    await bot.setWebHook(url);
    console.log("✅ Webhook set:", url);
  } else {
    console.log("❌ Domain not found");
  }
});
