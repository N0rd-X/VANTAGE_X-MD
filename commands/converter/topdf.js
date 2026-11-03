'use strict';

const config = require('../../config');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { convertQuoted } = require('../../lib/media');

const execFileAsync = promisify(execFile);

module.exports = {
    name: 'topdf',
    aliases: ['pdf', 'img2pdf'],
    category: 'converter',
    description: 'Convert image to PDF',
    weight: 'heavy',
    usage: `${config.prefix}topdf (reply to image)`,

    async execute(sock, msg) {
        return convertQuoted(sock, msg, {
            label:    'topdf',
            accepts:  ['imageMessage'],
            notFound: `❌ Reply to an image with ${config.prefix}topdf`,
            waiting:  '📄 Converting to PDF...',
            inExt:    'jpg',
            outExt:   'pdf',
            run:      ({ input, output }) => execFileAsync('img2pdf', [input, '-o', output], { timeout: 60_000 }),
            reply:    (buf) => ({ document: buf, mimetype: 'application/pdf', fileName: 'converted.pdf' }),
            errorText: '❌ Failed. Is img2pdf installed? (pip install img2pdf)',
        });
    },
};
