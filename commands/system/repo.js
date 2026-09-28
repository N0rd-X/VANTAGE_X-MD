'use strict';

const config    = require('../../config');
const axios     = require('axios');
const { send }  = require('../../helpers');
const { card, sc } = require('../../lib/messageStyle');

const REPO_OWNER = 'N0rd-X';
const REPO_NAME  = 'VANTAGE_X-MD';
const REPO_URL   = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

module.exports = {
    name: 'repo',
    aliases: ['repository', 'source'],
    category: 'system',
    description: 'Show repository details, live project statistics and resources',
    usage: `${config.prefix}repo`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            wait = await sock.sendMessage(jid, { text: '📦 Fetching repo stats…' });

            // ── Live GitHub stats ─────────────────────────────────────────────
            let stars = 'N/A', forks = 'N/A', watchers = 'N/A', issues = 'N/A', size = 'N/A';
            try {
                const { data } = await axios.get(
                    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
                    { timeout: 10_000, headers: { 'User-Agent': `${REPO_NAME}-Bot` } }
                );
                stars    = data.stargazers_count  ?? 'N/A';
                forks    = data.forks_count        ?? 'N/A';
                watchers = data.subscribers_count  ?? 'N/A';
                issues   = data.open_issues_count  ?? 'N/A';
                size     = data.size ? `${(data.size / 1024).toFixed(2)} MB` : 'N/A';
            } catch {
                // API unreachable — stats fall back to N/A, rest still renders
            }

            // ── Cards ─────────────────────────────────────────────────────────
            const repoCard = card(
                `⬢【 ${sc('vantage-x md')} 】`,
                [
                    `⌬ ${sc('name')}: ${sc('vantage-x md')}`,
                    `⌬ ${sc('owner')}: N0rd-X`,
                    `⌬ ${sc('license')}: MIT`,
                    `⌬ ${sc('repository')}: ${REPO_URL}`,
                ]
            );

            const statsCard = card(
                `📊【 ${sc('project statistics')} 】`,
                [
                    `⭐ ${sc('stars')}: ${stars}`,
                    `🍴 ${sc('forks')}: ${forks}`,
                    `👁️ ${sc('watchers')}: ${watchers}`,
                    `🐛 ${sc('issues')}: ${issues}`,
                    `💾 ${sc('size')}: ${size}`,
                ]
            );

            const resourcesCard = card(
                `🤖【 ${sc('bot resources')} 】`,
                [
                    `🔑 ${sc('pairing')}`,
                    global.pairingsite || 'https://vantagex-pairing.onrender.com/',
                ],
                [
                    `🎬 ${sc('deployment guide')}`,
                    'https://youtu.be/4PQcn-qqrcE',
                ],
                [
                    `📢 ${sc('whatsapp channel')}`,
                    config.whatsappchannel,
                ],
                [
                    `💬 ${sc('support group')}`,
                    config.whatsappgroup,
                ],
            );

            const text = [
                `『 📦 ${sc('repository')} 』`,
                repoCard,
                '',
                `『 📊 ${sc('project statistics')} 』`,
                statsCard,
                '',
                `『 🤖 ${sc('bot resources')} 』`,
                resourcesCard,
            ].join('\n');

            await sock.sendMessage(jid, { text, edit: wait.key });

        } catch (err) {
            console.error('[repo]', err.message);
            if (wait) await sock.sendMessage(jid, { text: global.mess.error, edit: wait.key });
            else await send(sock, jid, global.mess.error);
        }
    }
};

