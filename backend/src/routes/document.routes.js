const express = require('express');

const documentController = require('../controllers/document.controller');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/upload', upload, documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
