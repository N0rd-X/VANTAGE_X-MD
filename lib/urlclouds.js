'use strict';

const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');

/**
 * Upload a file and return a public URL.
 * Default provider: catbox.moe (free, no account needed).
 *
 * @param {string} filePath - Absolute path to the file to upload
 * @returns {Promise<string>} Public download URL
 */
async function uploadFile(filePath) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', fs.createReadStream(filePath));

  const res = await axios.post('https://catbox.moe/user.php', form, {
    headers: form.getHeaders(),
    timeout: 30_000,
  });

  if (!res.data || typeof res.data !== 'string' || !res.data.startsWith('http')) {
    throw new Error(`Upload failed: ${res.data}`);
  }

  return res.data.trim();
}

/**
 * Upload a Buffer and return a public URL.
 *
 * @param {Buffer} buffer
 * @param {string} filename - e.g. 'sticker.webp'
 * @returns {Promise<string>}
 */
async function uploadBuffer(buffer, filename = 'file') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, { filename });

  const res = await axios.post('https://catbox.moe/user.php', form, {
    headers: form.getHeaders(),
    timeout: 30_000,
  });

  if (!res.data || typeof res.data !== 'string' || !res.data.startsWith('http')) {
    throw new Error(`Upload failed: ${res.data}`);
  }

  return res.data.trim();
}

module.exports = { uploadFile, uploadBuffer };
