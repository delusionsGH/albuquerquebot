// this is a mess
// at least we think it is
// ok it definitely is
// actually wait it might possibly not be a mess actually
// -noodles and delusions
const decoder = new TextDecoder("utf-8");
const readfile = JSON.parse(decoder.decode(Deno.readFileSync("./supersecret.txt")));
const maelinkws = "wss://maelink-ws.derpygamer2142.com"
const maelinkhttp = "https://maelink-http.derpygamer2142.com"
const conn = new WebSocket(maelinkws);
import { Client, Events, GatewayIntentBits } from 'discord.js';
const disconn = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

disconn.once(Events.ClientReady, readyClient => {
    console.log(`ready! logged in as ${readyClient.user.tag}`);
});
disconn.on(Events.Message, async message => {
    if (message.author.bot) return;
    if (message.channelId === readfile.DISCORDCHANNELID) {
        conn.send(JSON.stringify({ "cmd": "post", "p": message.content }))
    }
});
disconn.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'miau') {
        await interaction.reply('MIAU\n*pvz victory music*');
    }
    if (interaction.commandName === 'echo') {
        const message = interaction.options.getString('message');
        await interaction.reply(message);
    }
    if (interaction.commandName === 'albuquerque') {
        const message = decoder.decode(Deno.readFileSync("./albuquerque.txt"));
        await interaction.reply(message);
    }
});
import { REST, Routes } from 'discord.js';
const commands = [
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
];
const rest = new REST({ version: '10' }).setToken(readfile.DISCORDTOKEN);
(async () => {
    try {
        console.log('started reloading guild (/) commands...');
        await rest.put(
            Routes.applicationGuildCommands(readfile.DISCORDCLIENTID, readfile.DISCORDGUILDID),
            { body: commands },
        );
        console.log('done reloading guild (/) commands!');
    } catch (error) {
        console.error(error);
    }
})();
disconn.login(readfile.DISCORDTOKEN);
conn.onopen = () => {
    console.log("we're gaming on maelink | logging in");
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
                console.error(`HTTP error! Status: ${response.status}`);
                return response.text().then(text => {
                    console.error("Response body:", text);
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`); // Throw an error to stop further execution
                });
            }
            return response.json();
        })
        .then(data => console.log(data))
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
    console.log("man im dead :skrul:");
};