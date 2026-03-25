const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const ADMIN_ID = @guruji_i;

let users = {};
let history = [];

// START
bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;

    users[id] = { verified: false, active: true };

    bot.sendMessage(id,
`🚀 Welcome

🔗 https://www.czIndia.com/#/register?invitationCode=85821434737

Upar Diye Link Pe Click Karke Register Karo & recharge Minimum 200₹ - 300₹

📩 Apna Game ID bhejo verification ke liye

⚙️ Commands:
/stop - band
/startpred - start`
    );
});

// USER MESSAGE (verification)
bot.on('message', (msg) => {
    const id = msg.chat.id;

    if (!users[id]) return;
    if (msg.text.startsWith("/")) return;

    if (!users[id].verified) {
        bot.sendMessage(ADMIN_ID,
`🆕 Verification Request

User ID: ${id}
Message: ${msg.text}

/approve ${id}`
        );

        bot.sendMessage(id, "⏳ Verification pending...");
    }
});

// ADMIN
bot.onText(/\/approve (\d+)/, (msg, match) => {
    if (msg.chat.id != ADMIN_ID) return;

    const userId = match[1];

    users[userId].verified = true;
    users[userId].active = true;

    bot.sendMessage(userId, "✅ Verified!");
});

// STOP
bot.onText(/\/stop/, (msg) => {
    const id = msg.chat.id;
    if (users[id]) users[id].active = false;

    bot.sendMessage(id, "🛑 Prediction band");
});

// START AGAIN
bot.onText(/\/startpred/, (msg) => {
    const id = msg.chat.id;

    if (users[id] && users[id].verified) {
        users[id].active = true;
        bot.sendMessage(id, "▶️ Prediction chalu");
    }
});

// PREDICTION
function getPrediction() {
    let result = Math.random() > 0.5 ? "BIG" : "SMALL";

    history.unshift(result);
    if (history.length > 10) history.pop();

    return result;
}

// ⏰ SYNC FUNCTION (main magic)
function startSyncedTimer() {
    const now = new Date();
    const seconds = now.getSeconds();

    // next minute ke 00 sec ka wait
    const delay = (60 - seconds) * 1000;

    setTimeout(() => {

        // har 60 sec pe run hoga (aligned)
        setInterval(() => {

            Object.keys(users).forEach(id => {
                if (users[id].verified && users[id].active) {

                    let result = getPrediction();
                    let last3 = history.slice(0, 3).join(" | ");

                    bot.sendMessage(id,
`⏰ SYNC PREDICTION

🕐 Time: ${new Date().toLocaleTimeString()}

🔥 RESULT → ${result}
📊 Last 3 → ${last3 || "No data"}`
                    );
                }
            });

        }, 60000);

    }, delay);
}

// START TIMER
startSyncedTimer();
