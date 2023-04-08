// Load up the discord.js library
import { Client } from "discord.js";
import LRU from "lru-cache";
import Faucet from './faucet';
import config, { prefix, limit, token } from "./config";

const client = new Client();
const faucet = new Faucet(config);
const cache = new LRU();


client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Faucet Bot has started`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    //client.user.setActivity(`...`, { type: 'WATCHING' });
});

client.on("message", async message => {

    // console.log(message.author.id);

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // prefix: !, / and >
    if (!/^(!|\/|>)/.test(message.content)) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Let's go with a few common example commands! Feel free to delete or change those.

    switch (command) {
        case "faucet":
            let msg = `Sorry please wait for ${limit} hours between token requests from the same account!`;
            if (!cache.has(message.author.id)) {
                msg = await faucet.send(args[0]);
                cache.set(message.author.id, 1, 1000 * 60 * 60 * limit);
            }

            //message.channel.send(msg);
            await message.reply(msg);
            break;

        // case "help":

        //     var msg = fs.readFileSync("./help.txt", 'utf-8');

        //     message.channel.send(msg);
        default:
            break;
    }


});


client.login(token);
