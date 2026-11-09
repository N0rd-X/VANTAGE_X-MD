'use strict';

const config = require('../../config');
const fs = require('fs').promises;
const { convertQuoted, FONT_FILE } = require('../../lib/media');

module.exports = {
    name: 'write',
    aliases: ['caption', 'writeonimg'],
    category: 'converter',
    description: 'Write text on an image',
    weight: 'heavy',
    usage: `${config.prefix}write <text> (reply to image)`,

    async execute(sock, msg, args) {
        if (!args[0]) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Reply to an image and provide text.\n${this.usage}`,
            });
        }

        const text = args.join(' ').slice(0, 300);

        return convertQuoted(sock, msg, {
            label:    'write',
            accepts:  ['imageMessage'],
            notFound: `❌ Reply to an image and provide text.\n${this.usage}`,
            waiting:  '✍️ Writing text...',
            inExt:    'jpg',
            outExt:   'jpg',
            args: async ({ tmpFile }) => {
                const textFile = tmpFile('txt');
                await fs.writeFile(textFile, text);
                const font = FONT_FILE ? `:fontfile='${FONT_FILE}'` : '';
                return ['-vf', `drawtext=textfile='${textFile}'${font}:fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`];
            },
            reply: (buf) => ({ image: buf, caption: `✍️ ${text}` }),
        });
    },
};
