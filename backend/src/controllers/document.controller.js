const documentService = require('../services/document.service');

const DEFAULT_OWNER = 'anonymous';

function resolveOwner(req) {
    const owner = req.get('X-User-Id');
    return owner && owner.trim() ? owner.trim() : DEFAULT_OWNER;
}

function upload(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    res.status(201).json(documentService.createDocument(req.file, resolveOwner(req)));
}

function list(req, res) {
    res.json(documentService.listDocuments(resolveOwner(req)));
}

function download(req, res, next) {
    const document = documentService.getDocumentForDownload(req.params.id, resolveOwner(req));

    if (!document) {
        return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    res.setHeader('Content-Type', document.metadata.mimeType);
    res.download(document.filePath, document.metadata.originalName, (error) => {
        if (error) {
            next(error);
        }
    });
}

module.exports = {
    upload,
    list,
    download,
};
