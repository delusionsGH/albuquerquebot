// deno-lint-ignore-file

// ^^^^ DO NOT REMOVE THIS, THIS IS TO DISABLE DENO COMPLAINING ABOUT MY BAD CODE -delusions ^^^^

// this is a mess
// at least we think it is
// ok it definitely is
// actually wait it might possibly not be a mess actually
// -noodles and delusions
const decoder = new TextDecoder("utf-8");
const readfile = JSON.parse(decoder.decode(Deno.readFileSync("./supersecret.txt")));
try {
    Deno.readFileSync("./db.txt");
} catch {
    Deno.writeTextFileSync("./db.txt", JSON.stringify([]));
}
// maelink
const maelinkws = "wss://maelink-ws.derpygamer2142.com"
const maelinkhttp = "https://maelink-http.derpygamer2142.com"
const conn = new WebSocket(maelinkws);
let MAETOKEN;
console.log("ALBUQUERQUEBOT - v1.31 - attachments");
conn.onopen = () => {
    console.log("starting up maelink bot...");
    fetch(maelinkhttp + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "username": "albuquerquebot",
            "password": readfile.MAELINKPASSWORD
        })
    })
        .then(response => {
            if (!response.ok) {
                console.error(`http error! status: ${response.status}`);
                return response.text().then(text => {
                    console.error("response body:", text);
                    throw new Error(`http error! status: ${response.status}, body: ${text}`);
                });
            }
            return response.json();
        })
        .then(responseJson => {
            MAETOKEN = responseJson.token;
            console.log("maelink bot has started up!");
            return responseJson;
        })
        .catch(e => console.error(e));
}
conn.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.cmd === "post_home" && data.post.u != "albuquerquebot") { // we dont want infinite pingpong
        fetch(readfile.WEBHOOKURL, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "content": data.post.p, "username": `${data.post.u} [BRIDGED]`
            })
        })
    }
}
conn.onerror = (error) => {
    console.error("ruh roh:", error);
};
conn.onclose = () => {
    console.log("man im dead :skrul: | reconnecting");
    setTimeout(connectWebSocket, 500);
};
// discord
import { Client, Events, GatewayIntentBits } from 'discord.js';
const disconn = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
disconn.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (message.channelId === readfile.DISCORDCHANNELID && conn.readyState === WebSocket.OPEN) {
        let messageContent = `${message.author.displayName}: ${message.content.replace(/<:.*?:(\d+)>/g, '![](https://cdn.discordapp.com/emojis/$1.png?size=16)')}`;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            messageContent += `\n\n![](${attachment.url})`;
        }
        conn.send(JSON.stringify({ "cmd": "post", "p": messageContent, "token": MAETOKEN }));
        let dbData = [];
        try {
            dbData = JSON.parse(decoder.decode(Deno.readFileSync("./db.txt")));
        } catch {
            // file doesn't exist or is empty, use empty array
        }
        const userEntry = dbData.find(entry => entry.userId === message.author.id);
        if (userEntry && userEntry.choice === true) {
            message.react("✅");
        }
    }
});
disconn.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
        case 'miau':
            await interaction.reply('MIAU\n*pvz victory music*');
            break;
        case 'echo':
            const message = interaction.options.getString('message');
            await interaction.reply(message);
            break;
        case 'albuquerque':
            const albuquerqueMessage = decoder.decode(Deno.readFileSync("./albuquerque.txt"));
            await interaction.reply(albuquerqueMessage);
            break;
        case 'miaugif':
            await interaction.reply("https://tenor.com/view/miau-hd-adobe-after-effects-glass-breaking-preset-gif-752576862881430143");
            break;
        case 'toggle_react':
            const enabled = interaction.options.getBoolean('enabled');
            const userId = interaction.user.id;
            let dbData = [];
            try {
                dbData = JSON.parse(decoder.decode(Deno.readFileSync("./db.txt")));
            } catch {
                // file doesn't exist or is empty, use empty array
            }
                const existingUser = dbData.find(entry => entry.userId === userId);
                if (existingUser) {
                    existingUser.choice = enabled;
                } else {
                    dbData.push({
                        userId: userId,
                        choice: enabled
                    });
                }
                Deno.writeTextFileSync("./db.txt", JSON.stringify(dbData));
                await interaction.reply({ content: `✅ is now ${enabled ? "enabled" : "disabled"}`, ephemeral: true });
            }
        
    }
);
import { REST, Routes } from 'discord.js';
const gcommands = [
    {
        name: 'toggle_react',
        description: 'toggle if i ✅ you in #maelink',
        options: [{ name: 'enabled', type: 5, description: 'whether ✅ should be enabled', required: false }],
    },
];
const rest = new REST({ version: '10' }).setToken(readfile.DISCORDTOKEN);
(async () => {
    try {
        console.log('started reloading guild (/) commands...');
        await rest.put(
            Routes.applicationGuildCommands(readfile.DISCORDCLIENTID, readfile.DISCORDGUILDID),
            { body: gcommands },
        );
        console.log('done reloading guild (/) commands!');
    } catch (error) {
        console.error(error);
    }
})();
const glcommands = [
    {
        name: 'miau',
        description: 'says the MIAU',
    },
    {
        name: 'echo',
        description: 'echo echo echo echo',
        options: [{ name: 'message', type: 3, description: 'echo', required: true }],
    },
    {
        name: 'albuquerque',
        description: 'albuquerque',
    },
    {
        name: 'miaugif',
        description: 'watch the miau as it explodes, albot edition',
    },
];
const grest = new REST({ version: '10' }).setToken(readfile.DISCORDTOKEN);
(async () => {
    try {
        console.log('started reloading application (/) commands...');
        await grest.put(
            Routes.applicationCommands(readfile.DISCORDCLIENTID),
            { body: glcommands },
        );
        console.log('done reloading application (/) commands!');
    } catch (error) {
        console.error(error);
    }
})();
disconn.on(Events.ClientReady, c => {
    console.log(`discord bot has started up!`);
});
disconn.login(readfile.DISCORDTOKEN);