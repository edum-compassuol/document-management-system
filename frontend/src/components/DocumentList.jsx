import DownloadButton from './DownloadButton.jsx';

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

function formatSize(bytes) {
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${SIZE_UNITS[unitIndex]}`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents, loading }) {
  if (loading) {
    return <p>Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado até o momento.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Nome</th>
          <th style={{ textAlign: 'left' }}>Tipo</th>
          <th style={{ textAlign: 'right' }}>Tamanho</th>
          <th style={{ textAlign: 'left' }}>Enviado em</th>
          <th style={{ textAlign: 'left' }}>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{document.mimeType}</td>
            <td style={{ textAlign: 'right' }}>{formatSize(document.size)}</td>
            <td>{formatDate(document.uploadedAt)}</td>
            <td>
              <DownloadButton
                documentId={document.id}
                fileName={document.originalName}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
