const fs = require('node:fs');
const path = require('node:path');

const config = require('../config');

// Responsável apenas pelo arquivo físico. Os metadados ficam em document.repository.
function resolvePath(storedName) {
    return path.join(config.storageDir, storedName);
}

function createReadStream(storedName) {
    return fs.createReadStream(resolvePath(storedName));
}

module.exports = {
    createReadStream,
};
