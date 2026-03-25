// 🔥 CRASH PROTECTION
process.on('uncaughtException', (err) => {
    console.log('Error:', err.message);
});

const TelegramBot = require('node-telegram-bot-api');

// ❗ TOKEN CHECK
if (!process.env.BOT_TOKEN) {
    console.log("❌ BOT_TOKEN missing!");
    process.exit(1);
}

// ✅ SAFE POLLING (409 FIX HELP)
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
        autoStart: true,
        interval: 300,
        params: { timeout: 10 }
    }
});

// 🔐 ADMIN ID (CHANGE THIS)
const ADMIN_ID = 1342806336;

let users = {};
let history = [];

// 🎛️ BUTTON MENU
function getMenu() {
    return {
        reply_markup: {
            keyboard: [
                ["🟢 START", "🔴 STOP"]
            ],
            resize_keyboard: true
        }
    };
}

// 🚀 START
bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;

    users[id] = { verified: false, active: false };

    bot.sendMessage(id,
`🚀 Welcome

Niche Diye Link Pe Click Karke Register Karo & recharge Minimum 200₹ - 300₹

🔗 https://www.91appy.com/#/register?invitationCode=85821434737

📩 Apna Game ID bhejo verification ke liye`,
    getMenu()
    );
});

// 📩 MESSAGE HANDLER
bot.on('message', (msg) => {
    const id = msg.chat.id;

    if (!users[id]) return;

    // ❗ Fix crash (no text case)
    if (!msg.text || msg.text.startsWith("/")) return;

    // VERIFY REQUEST
    if (!users[id].verified) {
        bot.sendMessage(ADMIN_ID,
`🆕 Verification Request

User ID: ${id}
Message: ${msg.text}

/approve ${id}  ya  /reject ${id}`
        );

        bot.sendMessage(id, "⏳ Verification pending...");
        return;
    }

    // 🟢 START BUTTON
    if (msg.text === "🟢 START") {
        users[id].active = true;
        bot.sendMessage(id, "▶️ Prediction chalu ho gaya", getMenu());
    }

    // 🔴 STOP BUTTON
    if (msg.text === "🔴 STOP") {
        users[id].active = false;
        bot.sendMessage(id, "🛑 Prediction band ho gaya", getMenu());
    }
});

// ✅ ADMIN APPROVE
bot.onText(/\/approve (\d+)/, (msg, match) => {
    if (msg.chat.id != ADMIN_ID) return;

    const userId = match[1];

    users[userId] = users[userId] || { verified: false, active: false };

    users[userId].verified = true;
    users[userId].active = true;

    bot.sendMessage(userId, "✅ Verified! Prediction start ho gaya", getMenu());
});

// ❌ ADMIN REJECT
bot.onText(/\/reject (\d+)/, (msg, match) => {
    if (msg.chat.id != ADMIN_ID) return;

    const userId = match[1];

    bot.sendMessage(userId, "❌ Verification failed");
});

// 🎯 PREDICTION LOGIC
function getPrediction() {
    let result = Math.random() > 0.5 ? "BIG" : "SMALL";

    history.unshift(result);
    if (history.length > 10) history.pop();

    return result;
}

// ⏰ AUTO PREDICTION
setInterval(() => {
    Object.keys(users).forEach(id => {
        if (users[id].verified && users[id].active) {

            let result = getPrediction();
            let last3 = history.slice(0, 3).join(" | ");

            bot.sendMessage(id,
`⏰ AUTO PREDICTION

🔥 RESULT → ${result}
📊 Last 3 → ${last3 || "No data"}`
            );
        }
    });
}, 60000);

console.log("🚀 Bot started successfully");
