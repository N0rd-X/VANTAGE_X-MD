'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'nightcore',
    aliases: ['nc', 'speedup'],
    category: 'converter',
    description: 'Nightcore audio effect',
    weight: 'heavy',
    usage: `${config.prefix}nightcore (reply to audio)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'nightcore',
            accepts:  ['audioMessage', 'videoMessage'],
            notFound: `❌ Reply to an audio with ${config.prefix}nightcore`,
            waiting:  '🎵 Applying nightcore...',
            inExt:    'mp3',
            outExt:   'mp3',
            args:     ['-vn', '-af', 'asetrate=44100*1.25,aresample=44100'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'nightcore.mp3' }),
        });
    },
};
