'use strict';

const config = require('../../config');
const { makeSetter } = require('../../lib/welcomeCommands');

module.exports = makeSetter('welcome', {
    name: 'setwelcome',
    aliases: ['setwlc'],
    description: 'Set a custom welcome message (multi-line OK)',
    usage: `${config.prefix}setwelcome <text>`,
});
