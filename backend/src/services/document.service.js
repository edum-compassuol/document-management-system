const path = require('node:path');

const documentRepository = require('../repositories/document.repository');

// O campo storedName é interno e não é exposto pela API.
function toPublicDocument({ id, originalName, mimeType, size, uploadedAt, owner }) {
    return { id, originalName, mimeType, size, uploadedAt, owner };
}

function createDocument(file, owner) {
    const document = {
        // O multer grava o arquivo como <uuid><extensão>, então o id é o nome sem a extensão.
        id: path.parse(file.filename).name,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
    };

    documentRepository.save(document);
    return toPublicDocument(document);
}

function listDocuments(owner) {
    return documentRepository
        .findAllByOwner(owner)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
        .map(toPublicDocument);
}

function getDocumentForDownload(id, owner) {
    const document = documentRepository.findById(id);

    if (!document || document.owner !== owner) {
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
