'use strict';

const config = require('../../config');
const { makeToggle } = require('../../lib/welcomeCommands');

module.exports = makeToggle('welcome', {
    name: 'welcome',
    aliases: ['welcomemsg'],
    description: 'Toggle welcome messages, preview them, or view settings',
    usage: `${config.prefix}welcome on|off|test`,
});
