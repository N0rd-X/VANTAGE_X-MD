'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'togif',
    aliases: ['gif'],
    category: 'converter',
    description: 'Convert video to GIF',
    weight: 'heavy',
    usage: `${config.prefix}togif (reply to video)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'togif',
            accepts:  ['videoMessage'],
            notFound: `❌ Reply to a video with ${config.prefix}togif`,
            waiting:  '🎞️ Converting to GIF...',
            inExt:    'mp4',
            outExt:   'gif',
            args:     ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-t', '7'],
            reply:    (buf) => ({ video: buf, gifPlayback: true, caption: '🎞️ Converted to GIF' }),
            errorText: '❌ Conversion failed. Is ffmpeg installed?',
        });
    },
};
