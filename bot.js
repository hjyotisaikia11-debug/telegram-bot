const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('8626075245:AAFw27c2OmhCy9oxsGhKXJX0_9ItPWravsM', { polling: true });

let users = {};
let history = [];

bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;

    users[id] = { verified: false };

    bot.sendMessage(id,
        "🚀 Welcome!\n\nRegister:\nhttps://www.guwahati91.com/#/register?invitationCode=85821434737\n\nClick VERIFY",
        {
            reply_markup: {
                keyboard: [
                    ["VERIFY"],
                    ["🎯 Predict Now", "📊 History"]
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.on('message', (msg) => {
    const id = msg.chat.id;

    if (!users[id]) users[id] = { verified: false };

    if (msg.text === "VERIFY") {
        users[id].verified = true;
        bot.sendMessage(id, "✅ Verified!");
    }

    if (msg.text === "🎯 Predict Now") {
        if (!users[id].verified) {
            bot.sendMessage(id, "❌ Verify first");
            return;
        }

        let result = Math.random() > 0.5 ? "BIG" : "SMALL";

        history.unshift(result);
        if (history.length > 10) history.pop();

        bot.sendMessage(id, "🔥 Prediction: " + result);
    }

    if (msg.text === "📊 History") {
        if (history.length === 0) {
            bot.sendMessage(id, "No history");
            return;
        }

        let text = "📊 History:\n\n";
        history.forEach((h, i) => {
            text += `${i + 1}. ${h}\n`;
        });

        bot.sendMessage(id, text);
    }
});

setInterval(() => {
    Object.keys(users).forEach(id => {
        if (users[id].verified) {
            let result = Math.random() > 0.5 ? "BIG" : "SMALL";
            bot.sendMessage(id, "⏰ AUTO: " + result);
        }
    });
}, 60000);
