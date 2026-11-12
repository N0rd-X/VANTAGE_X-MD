'use strict';

const config       = require('../config');
const { requireGroup, rawArgs } = require('../helpers');
const { card, sc } = require('./messageStyle');
const settings     = require('../services/groupsettings');

const UI = {
    welcome: { icon: '👋', setCmd: 'setwelcome', noun: 'Welcome' },
    goodbye: { icon: '🚪', setCmd: 'setgoodbye', noun: 'Goodbye' },
};

const PLACEHOLDERS = '@user  @group  @count (members)  @desc (group description)';

// Render a template the way the handler will, using the group's real details.
function preview(kind, ctx, num) {
    return settings.render(settings.template(ctx.jid, kind), {
        num,
        group: ctx.meta.subject || 'this group',
        desc:  ctx.meta.desc    || '',
        count: ctx.meta.participants.length,
    });
}

// `!welcome` / `!goodbye`: on | off | test | (status)
function makeToggle(kind, meta) {
    const ui = UI[kind];
    return {
        ...meta,
        category: 'group',

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            try {
                const ctx = await requireGroup(sock, msg, { admin: true });
                if (!ctx) return;

                const action = args[0]?.toLowerCase();
                const badge  = (on) => on ? `${sc('on')} 🟢` : `${sc('off')} 🔴`;

                if (action === 'on' || action === 'off') {
                    settings.update(jid, { [kind]: action === 'on' });
                    return await sock.sendMessage(jid, {
                        text: card(`${ui.icon}【 ${sc(kind)} 】`, [`⚙️ *${sc('status')}:* ${badge(action === 'on')}`]),
                    }, { quoted: msg });
                }

                if (action === 'test') {
                    const num = ctx.sender.split('@')[0];
                    return await sock.sendMessage(jid, { text: preview(kind, ctx, num), mentions: [ctx.sender] });
                }

                const custom = settings.custom(jid, kind);
                await sock.sendMessage(jid, {
                    text: card(`${ui.icon}【 ${sc(`${kind} settings`)} 】`, [
                        `⚙️ *${sc('status')}:*  ${badge(settings.isOn(jid, kind))}`,
                        `💬 *${sc('message')}:* ${custom || `${settings.template(jid, kind)} _(default)_`}`,
                        '',
                        `▸ ${config.prefix}${kind} on|off`,
                        `▸ ${config.prefix}${kind} test`,
                        `▸ ${config.prefix}${ui.setCmd} <text>`,
                    ]),
                }, { quoted: msg });
            } catch (err) {
                console.error(`[${kind}]`, err.message);
                await sock.sendMessage(jid, { text: global.mess.error });
            }
        },
    };
}

// `!setwelcome <text>` / `!setgoodbye <text>`: set (multi-line OK) or `reset`
function makeSetter(kind, meta) {
    const ui = UI[kind];
    const { flag, field } = settings.KINDS[kind];
    return {
        ...meta,
        category: 'group',

        async execute(sock, msg) {
            const jid = msg.key.remoteJid;
            try {
                const ctx = await requireGroup(sock, msg, { admin: true });
                if (!ctx) return;

                const text  = rawArgs(msg);
                const reply = (t) => sock.sendMessage(jid, { text: t });

                if (!text) {
                    return await reply(
                        `❌ Usage: ${meta.usage}\n` +
                        `Use ${config.prefix}${ui.setCmd} reset to go back to the default.\n\n` +
                        `Placeholders: ${PLACEHOLDERS}\nNew lines are kept.`
                    );
                }

                if (text.toLowerCase() === 'reset') {
                    settings.update(jid, { [field]: null });
                    return await reply(`✅ ${ui.noun} message reset to the default.`);
                }

                if (text.length > settings.MAX_MESSAGE) {
                    return await reply(`❌ That's ${text.length} characters; the limit is ${settings.MAX_MESSAGE}.`);
                }

                settings.update(jid, { [field]: text, [flag]: true });
                await sock.sendMessage(jid, {
                    text: `✅ ${ui.noun} message updated and *enabled*. Preview:\n\n${preview(kind, ctx, ctx.sender.split('@')[0])}`,
                    mentions: [ctx.sender],
                });
            } catch (err) {
                console.error(`[${ui.setCmd}]`, err.message);
                await sock.sendMessage(jid, { text: global.mess.error });
            }
        },
    };
}

module.exports = { makeToggle, makeSetter };
