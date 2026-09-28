'use strict';

const config   = require('../../config');
const axios    = require('axios');
const { send } = require('../../helpers');
const { card, sc } = require('../../lib/messageStyle');

module.exports = {
    name: 'apk',
    aliases: ['apkdl', 'getapk', 'getapp', 'appdl', 'playstore'],
    category: 'download',
    description: 'Search and download an APK from Aptoide',
    weight: 'heavy',
    usage: `${config.prefix}apk <app name>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const query = args.join(' ').trim();
            if (!query) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const wait = await sock.sendMessage(jid, { text: `🔍 Searching for *${query}*…` });

            const { data } = await axios.get(
                `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}/limit=1`,
                { timeout: 15_000, headers: { 'User-Agent': 'Mozilla/5.0' } }
            );

            const list = data?.datalist?.list;
            if (!list?.length) {
                return await sock.sendMessage(jid, {
                    text: `❌ No APK found for *${query}*`,
                    edit: wait.key
                });
            }

            const app     = list[0];
            const fileUrl = app.file?.path_alt || app.file?.path;

            if (!fileUrl) {
                return await sock.sendMessage(jid, {
                    text: `❌ Could not get a download link for *${app.name}*`,
                    edit: wait.key
                });
            }

            const sizeMB = app.size ? (app.size / 1_048_576).toFixed(2) : '?';
            const rating = app.stats?.rating?.avg?.toFixed(1) || 'N/A';
            const pkg    = app.package || 'N/A';
            const dev    = app.developer?.name || 'N/A';

            await sock.sendMessage(jid, {
                text: `✅ Found *${app.name}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                document: { url: fileUrl },
                fileName: `${app.name}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: card(
                    `📦【 ${sc('apk download')} 】`,
                    [
                        `📦 ${sc('name')}: ${app.name}`,
                        `🏋 ${sc('size')}: ${sizeMB} MB`,
                        `📦 ${sc('package')}: ${pkg}`,
                        `👨‍💻 ${sc('developer')}: ${dev}`,
                        `⭐ ${sc('rating')}: ${rating}`,
                    ]
                )
            }, { quoted: msg });

        } catch (err) {
            console.error('[apk]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
