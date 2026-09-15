const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const config = require('../config');

fs.mkdirSync(config.storageDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, config.storageDir);
    },
    filename: (req, file, callback) => {
        // O nome físico é um UUID, o que evita colisões e path traversal vindos do nome original.
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${crypto.randomUUID()}${extension}`);
    },
});

module.exports = multer({
    storage,
    limits: { fileSize: config.maxFileSize, files: 1 },
}).single('file');
