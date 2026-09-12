'use strict';

const config                 = require('../../config');
const os                     = require('os');
const { send }               = require('../../helpers');
const { card }               = require('../../lib/messageStyle');

module.exports = {
    name: 'alive',
    aliases: ['botinfo', 'bot'],
    category: 'system',
    description: 'Check bot status and system info',
    usage: `${config.prefix}alive`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const totalMem = Math.floor(os.totalmem() / 1024 / 1024);
            const freeMem  = Math.floor(os.freemem()  / 1024 / 1024);
            const usedMem  = totalMem - freeMem;

            const uptimeSecs = Math.floor(process.uptime());
            const d = Math.floor(uptimeSecs / 86400);
            const h = Math.floor((uptimeSecs % 86400) / 3600);
            const m = Math.floor((uptimeSecs % 3600)  / 60);

            const text =
                card('⚡【 ᴠᴀɴᴛᴀɢᴇ-x ɪs ᴀʟɪᴠᴇ 】', [
                    `👑 *Owner:*   ${config.ownername}`,
                    `🏷️ *Version:* v${config.version}`,
                    `⏱️ *Uptime:*  ${d}d ${h}h ${m}m`,
                    `💾 *Memory:*  ${usedMem}MB / ${totalMem}MB`,
                    `⚙️ *Node:*    ${process.version}`,
                    `🔣 *Prefix:*  ${config.prefix}`,
                ]) + `\n\n> ᴛʏᴘᴇ ${config.prefix}ᴍᴇɴᴜ ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅs`;

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[alive]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
