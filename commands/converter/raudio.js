'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'raudio',
    aliases: ['reverseaudio', 'revaudio'],
    category: 'converter',
    description: 'Reverse audio',
    weight: 'heavy',
    usage: `${config.prefix}raudio (reply to audio)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'raudio',
            accepts:  ['audioMessage', 'videoMessage'],
            notFound: `❌ Reply to an audio with ${config.prefix}raudio`,
            waiting:  '🔃 Reversing audio...',
            inExt:    'mp3',
            outExt:   'mp3',
            args:     ['-vn', '-af', 'areverse'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'reversed.mp3' }),
        });
    },
};
