const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'wiki',
    aliases: ['wikipedia', 'define'],
    category: 'search',
    description: 'Search Wikipedia for any topic',
    usage: `${config.prefix}wiki <topic>`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;

            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}wiki quantum computing`
                });
            }

            const query = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching Wikipedia...' });

            const searchRes = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    format: 'json',
                    utf8: 1
                }
            });

            const results = searchRes.data?.query?.search;
            if (!results?.length) {
                return await sock.sendMessage(jid, {
                    text: `❌ No Wikipedia results found for *${query}*.`,
                    edit: wait.key
                });
            }

            const pageTitle = results[0].title;

            const summaryRes = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    prop: 'extracts',
                    exintro: true,
                    explaintext: true,
                    titles: pageTitle,
                    format: 'json',
                    utf8: 1
                }
            });

            const pages = summaryRes.data?.query?.pages;
            const page = Object.values(pages)[0];
            const extract = page?.extract?.trim();

            if (!extract) {
                return await sock.sendMessage(jid, {
                    text: `❌ Could not get summary for *${pageTitle}*.`,
                    edit: wait.key
                });
            }

            // Trim to 800 chararacters for readability
            const summary = extract.length > 800
                ? extract.substring(0, 800) + '...'
                : extract;

            await sock.sendMessage(jid, {
                text: `📖 *${pageTitle}*\n\n${summary}\n\n🔗 https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
                edit: wait.key
            });

        } catch (error) {
            console.error('Wiki error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};