const path = require('node:path');

const documentRepository = require('../repositories/document.repository');

// O campo storedName é interno e não é exposto pela API.
function toPublicDocument({ id, originalName, mimeType, size, uploadedAt, owner }) {
    return { id, originalName, mimeType, size, uploadedAt, owner };
}

function buildDocument(file, owner) {
    return {
        // O multer grava o arquivo como <uuid><extensão>, então o id é o nome sem a extensão.
        id: path.parse(file.filename).name,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
    };
}

function isOwnedBy(document, owner) {
    return Boolean(document) && document.owner === owner;
}

function compareByUploadedAtDesc(a, b) {
    return b.uploadedAt.localeCompare(a.uploadedAt);
}

function createDocument(file, owner) {
    const document = buildDocument(file, owner);
    return toPublicDocument(documentRepository.save(document));
}

function listDocuments(owner) {
    return documentRepository
        .findAllByOwner(owner)
        .sort(compareByUploadedAtDesc)
        .map(toPublicDocument);
}

function getDocumentForDownload(id, owner) {
    const document = documentRepository.findById(id);

    if (!isOwnedBy(document, owner)) {
        return null;
    }

    return {
        metadata: toPublicDocument(document),
        filePath: documentRepository.resolveFilePath(document),
    };
}

module.exports = {
    createDocument,
    listDocuments,
    getDocumentForDownload,
};
