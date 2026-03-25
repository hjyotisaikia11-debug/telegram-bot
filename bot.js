process.on('uncaughtException', (err) => {
    console.log('Error:', err.message);
});

const TelegramBot = require('node-telegram-bot-api');

// TOKEN CHECK
if (!process.env.BOT_TOKEN) {
    console.log("❌ BOT_TOKEN missing!");
    process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN);

const ADMIN_ID = 1342806336;

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
`User: ${id}
Msg: ${msg.text}

/approve ${id}`
        );

        bot.sendMessage(id, "⏳ Pending...");
        return;
    }

    if (msg.text === "🟢 START") {
        users[id].active = true;
        bot.sendMessage(id, "▶️ Started");
    }

    if (msg.text === "🔴 STOP") {
        users[id].active = false;
        bot.sendMessage(id, "🛑 Stopped");
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
`🔥 RESULT → ${result}
📊 Last 3 → ${history.join(" | ")}`
            );
        }
    });
}, 60000);

// 🌐 WEBHOOK SERVER
const express = require("express");
const app = express();

app.use(express.json());

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Server started");
});
