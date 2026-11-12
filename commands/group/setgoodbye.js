'use strict';

const config = require('../../config');
const { makeSetter } = require('../../lib/welcomeCommands');

module.exports = makeSetter('goodbye', {
    name: 'setgoodbye',
    aliases: ['setbye'],
    description: 'Set a custom goodbye message (multi-line OK)',
    usage: `${config.prefix}setgoodbye <text>`,
});
