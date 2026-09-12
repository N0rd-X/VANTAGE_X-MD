'use strict';

const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');

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
