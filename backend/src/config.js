const path = require('node:path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = {
    port: Number(process.env.PORT) || 3000,
    storageDir: path.resolve(BACKEND_ROOT, process.env.STORAGE_DIR || './storage'),
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || DEFAULT_MAX_FILE_SIZE,
};
