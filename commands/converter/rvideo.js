'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'rvideo',
    aliases: ['reversevideo', 'revvid'],
    category: 'converter',
    description: 'Reverse video',
    weight: 'heavy',
    usage: `${config.prefix}rvideo (reply to video)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'rvideo',
            accepts:  ['videoMessage'],
            notFound: `❌ Reply to a video with ${config.prefix}rvideo`,
            waiting:  '🔃 Reversing video...',
            inExt:    'mp4',
            outExt:   'mp4',
            args:     ['-vf', 'reverse', '-af', 'areverse'],
            reply:    (buf) => ({ video: buf, caption: '🔃 Reversed video' }),
        });
    },
};
