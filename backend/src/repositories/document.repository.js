const path = require('node:path');

const config = require('../config');

// Metadados mantidos em memória nesta fase do projeto.
const documents = [];

function save(document) {
    documents.push(document);
    return document;
}

function findAllByOwner(owner) {
    return documents.filter((document) => document.owner === owner);
}

function findById(id) {
    return documents.find((document) => document.id === id) || null;
}

function resolveFilePath(document) {
    return path.join(config.storageDir, document.storedName);
}

module.exports = {
    save,
    findAllByOwner,
    findById,
    resolveFilePath,
};
