const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const ADMIN_ID = @guruji_i;

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

// START
bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;

    users[id] = { verified: false, active: false };

    bot.sendMessage(id,
`🚀 Welcome

🔗 https://www.czIndia.com/#/register?invitationCode=85821434737

Upar Diye Link Pe Click Karke Register Karo & recharge Minimum 200₹ - 300₹

📩 Apna Game ID bhejo verification ke liye`,
    getMenu()
    );
});

// MESSAGE HANDLER
bot.on('message', (msg) => {
    const id = msg.chat.id;

    if (!users[id]) return;

    // ignore commands
    if (msg.text.startsWith("/")) return;

    // VERIFY REQUEST
    if (!users[id].verified) {
        bot.sendMessage(ADMIN_ID,
`🆕 Verification Request

User ID: ${id}
Message: ${msg.text}

/approve ${id}`
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

// ADMIN APPROVE
bot.onText(/\/approve (\d+)/, (msg, match) => {
    if (msg.chat.id != ADMIN_ID) return;

    const userId = match[1];

    if (!users[userId]) users[userId] = {};

    users[userId].verified = true;
    users[userId].active = true;

    bot.sendMessage(userId, "✅ Verified! Prediction start ho gaya", getMenu());
});

// PREDICTION
function getPrediction() {
    let result = Math.random() > 0.5 ? "BIG" : "SMALL";

    history.unshift(result);
    if (history.length > 10) history.pop();

    return result;
}

// AUTO TIMER
setInterval(() => {
    Object.keys(users).forEach(id => {
        if (users[id].verified && users[id].active) {

            let result = getPrediction();
            let last3 = history.slice(0, 3).join(" | ");

            bot.sendMessage(id,
`⏰ AUTO PREDICTION

🔥 RESULT → ${result}
📊 Last 3 → ${last3}`
            );
        }
    });
}, 60000);
