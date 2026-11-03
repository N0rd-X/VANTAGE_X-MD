'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'slowmo',
    aliases: ['slow', 'slomo'],
    category: 'converter',
    description: 'Slow motion video',
    weight: 'heavy',
    usage: `${config.prefix}slowmo (reply to video)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'slowmo',
            accepts:  ['videoMessage'],
            notFound: `❌ Reply to a video with ${config.prefix}slowmo`,
            waiting:  '🐌 Making slow motion...',
            inExt:    'mp4',
            outExt:   'mp4',
            args:     ['-vf', 'setpts=2*PTS', '-af', 'atempo=0.5'],
            reply:    (buf) => ({ video: buf, caption: '🐌 Slow motion' }),
        });
    },
};
