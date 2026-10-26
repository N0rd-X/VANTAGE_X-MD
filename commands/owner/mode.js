'use strict';

const config                                 = require('../../config');
const { send }                               = require('../../helpers');
const { getMode, setMode, MODES, MODE_INFO } = require('../../services/commands');

const list = () => MODES.map(m => `• *${m}* — ${MODE_INFO[m]}`).join('\n');

module.exports = {
    name: 'mode',
    aliases: ['botmode', 'setmode'],
    category: 'owner',
    description: 'View or change the bot mode (public, private, inbox, group)',
    usage: `${config.prefix}mode <public|group|inbox|private>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const current = getMode();

            // No argument → show the current mode
            if (!args[0]) {
                return await send(sock, jid,
                    `⚙️ *Bot mode:* ${current}\n_${MODE_INFO[current]}_\n\n${list()}\n\nUsage: ${this.usage}`);
            }

            const wanted = args[0].toLowerCase();
            if (!MODES.includes(wanted)) {
                return await send(sock, jid, `❌ Invalid mode "${args[0]}".\n\n${list()}`);
            }
            if (wanted === current) {
                return await send(sock, jid, `ℹ️ Mode is already *${current}*.`);
            }

            const mode = setMode(wanted);
            await send(sock, jid, `✅ Mode set to *${mode}* — ${MODE_INFO[mode]}.`);

        } catch (err) {
            console.error('[mode]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
