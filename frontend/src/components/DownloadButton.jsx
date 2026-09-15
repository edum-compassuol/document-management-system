import { buildDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ documentId, fileName }) {
    return (
        <a
            href={buildDownloadUrl(documentId)}
            download={fileName}
            title={`Baixar ${fileName}`}
        >
            Baixar
        </a>
    );
}
