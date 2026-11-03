'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'tomp3',
    aliases: ['toaudio'],
    category: 'converter',
    description: 'Convert video to MP3',
    weight: 'heavy',
    usage: `${config.prefix}tomp3 (reply to video)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'tomp3',
            accepts:  ['videoMessage'],
            notFound: `❌ Reply to a video with ${config.prefix}tomp3`,
            waiting:  '🎵 Converting to MP3...',
            inExt:    'mp4',
            outExt:   'mp3',
            args:     ['-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'converted.mp3' }),
            errorText: '❌ Conversion failed. Is ffmpeg installed?',
        });
    },
};
