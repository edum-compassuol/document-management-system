const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, before, after } = require('node:test');
const assert = require('node:assert');

// O storage precisa ser definido antes de carregar o app, pois config.js lê o
// ambiente no momento do require.
const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDir;

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(storageDir, { recursive: true, force: true });
});

function uploadDocument({ content, filename, owner, type = 'text/plain' }) {
    const form = new FormData();
    form.append('file', new Blob([content], { type }), filename);

    return fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: { 'X-User-Id': owner },
        body: form,
    });
}

test('POST /upload grava o arquivo e devolve os metadados do documento', async () => {
    const response = await uploadDocument({
        content: 'conteudo do contrato',
        filename: 'contrato.txt',
        owner: 'alice',
    });

    assert.strictEqual(response.status, 201);

    const document = await response.json();
    assert.ok(document.id, 'o documento deve ter um id');
    assert.strictEqual(document.originalName, 'contrato.txt');
    assert.strictEqual(document.mimeType, 'text/plain');
    assert.strictEqual(document.size, Buffer.byteLength('conteudo do contrato'));
    assert.strictEqual(document.owner, 'alice');
    assert.ok(!('storedName' in document), 'o nome físico não deve ser exposto');

    const storedFiles = fs.readdirSync(storageDir);
    assert.ok(
        storedFiles.some((name) => name.startsWith(document.id)),
        'o arquivo deve existir no storage local',
    );
});

test('POST /upload retorna 400 quando nenhum arquivo é enviado', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: { 'X-User-Id': 'alice' },
        body: new FormData(),
    });

    assert.strictEqual(response.status, 400);

    const body = await response.json();
    assert.strictEqual(body.error, 'Nenhum arquivo enviado.');
});

test('GET /documents lista apenas os documentos do dono informado', async () => {
    await uploadDocument({ content: 'nota bob', filename: 'nota.txt', owner: 'bob' });
    await uploadDocument({ content: 'ata carol', filename: 'ata.txt', owner: 'carol' });

    const response = await fetch(`${baseUrl}/documents`, {
        headers: { 'X-User-Id': 'bob' },
    });

    assert.strictEqual(response.status, 200);

    const documents = await response.json();
    assert.ok(Array.isArray(documents), 'a listagem deve ser um array');
    assert.ok(
        documents.every((document) => document.owner === 'bob'),
        'a listagem não deve conter documentos de outros donos',
    );
    assert.ok(documents.some((document) => document.originalName === 'nota.txt'));
});

test('GET /documents/:id/download devolve o conteúdo original do arquivo', async () => {
    const uploadResponse = await uploadDocument({
        content: 'relatorio mensal',
        filename: 'relatorio.txt',
        owner: 'dan',
    });
    const { id } = await uploadResponse.json();

    const response = await fetch(`${baseUrl}/documents/${id}/download`, {
        headers: { 'X-User-Id': 'dan' },
    });

    assert.strictEqual(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /relatorio\.txt/);
    assert.strictEqual(await response.text(), 'relatorio mensal');
});

test('GET /documents/:id/download retorna 404 para documento inexistente', async () => {
    const response = await fetch(`${baseUrl}/documents/nao-existe/download`, {
        headers: { 'X-User-Id': 'dan' },
    });

    assert.strictEqual(response.status, 404);

    const body = await response.json();
    assert.strictEqual(body.error, 'Documento não encontrado.');
});

test('GET /documents/:id/download retorna 404 quando o documento é de outro dono', async () => {
    const uploadResponse = await uploadDocument({
        content: 'documento privado',
        filename: 'privado.txt',
        owner: 'erin',
    });
    const { id } = await uploadResponse.json();

    const response = await fetch(`${baseUrl}/documents/${id}/download`, {
        headers: { 'X-User-Id': 'frank' },
    });

    assert.strictEqual(response.status, 404);
});
