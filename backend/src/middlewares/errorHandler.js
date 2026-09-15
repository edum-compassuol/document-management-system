const multer = require('multer');

const MULTER_MESSAGES = {
    LIMIT_FILE_SIZE: { status: 413, error: 'Arquivo excede o tamanho máximo permitido.' },
    LIMIT_FILE_COUNT: { status: 400, error: 'Envie apenas um arquivo por requisição.' },
    LIMIT_UNEXPECTED_FILE: { status: 400, error: 'Campo de arquivo inválido. Utilize o campo "file".' },
};

module.exports = function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        const { status, error } = MULTER_MESSAGES[err.code] || {
            status: 400,
            error: 'Falha no envio do arquivo.',
        };
        return res.status(status).json({ error });
    }

    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
};
