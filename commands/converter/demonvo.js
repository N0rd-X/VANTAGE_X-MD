'use strict';

const config = require('../../config');
const { convertQuoted } = require('../../lib/media');

module.exports = {
    name: 'demonvo',
    aliases: ['demon', 'demonvoice', 'deep'],
    category: 'converter',
    description: 'Apply demon/deep voice effect',
    weight: 'heavy',
    usage: `${config.prefix}demonvo (reply to audio)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'demonvo',
            accepts:  ['audioMessage', 'videoMessage'],
            notFound: `❌ Reply to an audio with ${config.prefix}demonvo`,
            waiting:  '👿 Demonizing voice...',
            inExt:    'mp3',
            outExt:   'mp3',
            args:     ['-vn', '-af', 'asetrate=44100*0.6,aresample=44100,atempo=1.3,chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3'],
            reply:    (buf) => ({ audio: buf, mimetype: 'audio/mpeg', fileName: 'demon.mp3' }),
        });
    },
};
