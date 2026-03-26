process.on('uncaughtException', (err) => {
    console.log('Error:', err);
});

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
app.use(express.json());

// ❗ TOKEN CHECK
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
    console.log("❌ BOT_TOKEN missing!");
    process.exit(1);
}

const bot = new TelegramBot(TOKEN);

const ADMIN_ID = 1342806336; // 👈 apna ID daalo

let users = {};
let history = [];

// 🚀 START
bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;

    users[id] = { verified: false, active: false };

    bot.sendMessage(id,
`🚀 Welcome

Niche Diye Link Pe Click Karke Register Karo & recharge Minimum 200₹ - 300₹

🔗 https://www.jodhpur91.com/#/register?invitationCode=85821434737

📩 Apna Game ID bhejo verification ke liye`,
    {
        reply_markup: {
            keyboard: [["🟢 START", "🔴 STOP"]],
            resize_keyboard: true
        }
    });
});

// MESSAGE
bot.on('message', (msg) => {
    const id = msg.chat.id;

    if (!users[id]) return;
    if (!msg.text || msg.text.startsWith("/")) return;

    if (!users[id].verified) {
        bot.sendMessage(ADMIN_ID,
`🆕 Verification Request

User: ${id}
Msg: ${msg.text}

/approve ${id}`
        );

        bot.sendMessage(id, "⏳ Verification pending...");
        return;
    }

    if (msg.text === "🟢 START") {
        users[id].active = true;
        bot.sendMessage(id, "▶️ Prediction ON");
    }

    if (msg.text === "🔴 STOP") {
        users[id].active = false;
        bot.sendMessage(id, "🛑 Prediction OFF");
    }
});

// APPROVE
bot.onText(/\/approve (\d+)/, (msg, match) => {
    if (msg.chat.id != ADMIN_ID) return;

    const userId = match[1];

    users[userId] = { verified: true, active: true };

    bot.sendMessage(userId, "✅ Verified");
});

// AUTO
setInterval(() => {
    Object.keys(users).forEach(id => {
        if (users[id].verified && users[id].active) {

            let result = Math.random() > 0.5 ? "BIG" : "SMALL";

            history.unshift(result);
            if (history.length > 3) history.pop();

            bot.sendMessage(id,
`⏰ AUTO PREDICTION

🔥 RESULT → ${result}
📊 Last 3 → ${history.join(" | ")}`
            );
        }
    });
}, 60000);

// 🌐 WEBHOOK ROUTE
app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Bot is running");
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Server running on port " + PORT);

    bot.setWebHook(`https://telegram-bot-production-4252.up.railway.app/bot${TOKEN}`);
});
