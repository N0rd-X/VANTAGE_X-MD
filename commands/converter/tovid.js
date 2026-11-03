'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'tovid',
    aliases: ['tovideo'],
    category: 'converter',
    description: 'Convert GIF to video',
    weight: 'heavy',
    usage: `${config.prefix}tovid (reply to gif)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'tovid',
            accepts:  ['videoMessage', 'stickerMessage'],
            notFound: `❌ Reply to a GIF/sticker with ${config.prefix}tovid`,
            waiting:  '🎞️ Converting to video...',
            inExt:    'gif',
            outExt:   'mp4',
            args:     ['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'],
            reply:    (buf) => ({ video: buf, caption: '🎞️ Converted to video' }),
        });
    },
};
