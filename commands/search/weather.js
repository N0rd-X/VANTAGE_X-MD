const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'weather',
    aliases: ['forecast', 'temp'],
    category: 'search',
    description: 'Get weather forecast',
    usage: `${config.prefix}weather <city>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}weather London`
                });
            }
            
            const city = args.join(' ');
            
            await sock.sendMessage(jid, {
                text: '⏳ Fetching weather data...'
            });
            
            try {
                const response = await axios.get(`https://api.popcat.xyz/weather/${encodeURIComponent(city)}`);
                const data = response.data[0];
                
                if (!data) {
                    return await sock.sendMessage(jid, {
                        text: '❌ City not found. Please check spelling.'
                    });
                }
                
                const weatherText = `🌤️ **Weather in ${data.location}**\n\n` +
                                  `🌡️ Temperature: ${data.current.temperature}°C\n` +
                                  `💨 Wind: ${data.current.wind_speed} km/h ${data.current.wind_direction}\n` +
                                  `💧 Humidity: ${data.current.humidity}%\n` +
                                  `☁️ Sky: ${data.current.skytext}\n` +
                                  `👁️ Visibility: ${data.current.observationpoint}\n` +
                                  `📅 Updated: ${data.current.date}`;
                
                await sock.sendMessage(jid, {
                    text: weatherText
                });
                
            } catch (apiError) {
                console.error('Weather API error:', apiError);
                await sock.sendMessage(jid, {
                    text: '❌ Could not fetch weather data. Try again later.'
                });
            }
            
        } catch (error) {
            console.error('Weather error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error fetching weather'
            });
        }
    }
};