const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', async message => {
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const msg = await message.channel.send("Ping?")
        msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if (command === "say") {
        const sayMessage = args.join(" ");
        message.delete().catch(O_o=>{});
        message.channel.send(sayMessage);
    }

    if (command === "kick") {
        if (!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)))
            return message.reply("Sorry, you don't have permissions to use this command!");

        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!member)
          return message.reply("Please mention a valid member of this server");
        if(!member.kickable) 
          return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
          
        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No Reason Provided";

        message.delete().catch(O_o=>{});
        await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of ${error}`));
        message.channel.send(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
    }

    if (command === "ban") {
        if (!message.member.roles.some(r=>["Administrator"].includes(r.name)))
            return message.reply("Sorry, you don't have permissions to use this command!");

        let member = message.mentions.members.first();
        if (!member)
            return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No Reason Provided";

        message.delete().catch(O_o=>{});
        await member.ban(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of: ${error}`));
        message.channel.send(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }

    if (command === "create") {
        if (!message.member.hasPermission("MANAGE_CHANNELS"))
            return message.reply("Sorry, you don't have permissions to create channels!");

        let channeltype = args[0];
        let name = args.slice(1).join(' ');
        
        if (channeltype.toLowerCase() === "voice" || channeltype.toLowerCase() === "text") {
            let existerror = false;
            message.guild.channels.forEach(channel => {
                if (channel.type === channeltype) {
                    if (name.toLowerCase() === channel.name.toLowerCase()) {
                        existerror = true;
                    }
                }
            });
            if (existerror === false) {
                message.guild.createChannel(name, channeltype);
                channeltype = channeltype.charAt(0).toUpperCase() + channeltype.slice(1)
                message.channel.send(`${channeltype} Channel Created!`)
            }
            else {
                message.channel.send(`Channel with name ${name} already exists!`);
            }
        }
        else {
            message.channel.send("Invalid channel type provided.")
        }
    }

})
client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;
    let childrenchannels = [];

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        console.log(`Joined ${newUserChannel.name}`);
        if (newUserChannel.parent) {
            console.log(`Parent Channel: ${newUserChannel.parent.name}`)
            newUserChannel.parent.children.forEach(channel => {
                childrenchannels.push(channel.name);
            })
            console.log(`Children to parent: ${childrenchannels}`)
        }
        else {
            console.log("Channel doesn't have a parent")
        }
    }
    else if (newUserChannel === undefined) {
        console.log(`Left ${oldUserChannel.name}`)
    }
    else if (oldUserChannel !== undefined && newUserChannel !== undefined) {
        console.log(`moved from ${oldUserChannel.name} to ${newUserChannel.name}`);
    }
});



client.login(config.token);