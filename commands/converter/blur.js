'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'blur',
    aliases: ['blurred'],
    category: 'converter',
    description: 'Blur an image',
    weight: 'heavy',
    usage: `${config.prefix}blur (reply to image)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'blur',
            accepts:  ['imageMessage'],
            notFound: `❌ Reply to an image with ${config.prefix}blur`,
            waiting:  '🔮 Blurring...',
            inExt:    'jpg',
            outExt:   'jpg',
            args:     ['-vf', 'boxblur=10:1'],
            reply:    (buf) => ({ image: buf, caption: '🔮 Blurred image' }),
        });
    },
};
