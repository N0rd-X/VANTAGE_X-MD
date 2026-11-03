'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'bass',
    aliases: ['bassboost'],
    category: 'converter',
    description: 'Bass boost audio',
    weight: 'heavy',
    usage: `${config.prefix}bass (reply to audio)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'bass',
            accepts:  ['audioMessage', 'videoMessage'],
            notFound: `❌ Reply to an audio with ${config.prefix}bass`,
            waiting:  '🔊 Boosting bass...',
            inExt:    'mp3',
            outExt:   'mp3',
            args:     ['-vn', '-af', 'bass=g=20'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'bass_boosted.mp3' }),
            errorText: '❌ Processing failed. Is ffmpeg installed?',
        });
    },
};
