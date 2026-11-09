'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'robotvo',
    aliases: ['robot', 'robotvoice'],
    category: 'converter',
    description: 'Apply robot voice effect',
    weight: 'heavy',
    usage: `${config.prefix}robotvo (reply to audio)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'robotovo',
            accepts:  ['audioMessage', 'videoMessage'],
            notFound: `❌ Reply to an audio with ${config.prefix}robotvo`,
            waiting:  '🤖 Robotizing voice...',
            inExt:    'mp3',
            outExt:   'mp3',
            args:     ['-vn', '-af', 'asetrate=44100*0.8,aresample=44100,atempo=1.2,highpass=f=200,lowpass=f=3000'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'robot.mp3' }),
        });
    },
};
