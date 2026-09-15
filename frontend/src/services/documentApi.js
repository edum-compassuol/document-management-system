// Cliente HTTP do backend. O prefixo /api é removido pelo proxy do Vite.
const API_PREFIX = '/api';

const GENERIC_ERROR = 'Não foi possível completar a operação.';

async function extractErrorMessage(response) {
    try {
        const body = await response.json();
        return body?.error || GENERIC_ERROR;
    } catch {
        return GENERIC_ERROR;
    }
}

async function request(path, options) {
    let response;

    try {
        response = await fetch(`${API_PREFIX}${path}`, options);
    } catch {
        throw new Error('Não foi possível conectar ao servidor.');
    }

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    return response.json();
}

export function uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    return request('/upload', { method: 'POST', body: formData });
}

export function listDocuments() {
    return request('/documents');
}

export function buildDownloadUrl(id) {
    return `${API_PREFIX}/documents/${encodeURIComponent(id)}/download`;
}
