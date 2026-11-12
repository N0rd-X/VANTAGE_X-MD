'use strict';

const config         = require('../../config');
const { makeToggle } = require('../../lib/welcomeCommands');

module.exports = makeToggle('goodbye', {
    name: 'goodbye',
    aliases: ['byemsg', 'bye'],
    description: 'Toggle goodbye messages, preview them, or view settings',
    usage: `${config.prefix}goodbye on|off|test`,
});
