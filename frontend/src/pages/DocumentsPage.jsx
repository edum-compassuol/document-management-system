import { useCallback, useEffect, useState } from 'react';

import DocumentList from '../components/DocumentList.jsx';
import UploadComponent from '../components/UploadComponent.jsx';
import { listDocuments } from '../services/documentApi.js';

const MESSAGE_COLORS = { success: '#1a7f37', error: '#b42318' };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setDocuments(await listDocuments());
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleUploaded(document) {
    setMessage({ type: 'success', text: `"${document.originalName}" enviado com sucesso.` });
    refresh();
  }

  function handleError(text) {
    setMessage({ type: 'error', text });
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <UploadComponent onUploaded={handleUploaded} onError={handleError} />

      {message && (
        <p role="status" style={{ color: MESSAGE_COLORS[message.type] }}>
          {message.text}
        </p>
      )}

      <h2>Documentos</h2>
      <DocumentList documents={documents} loading={loading} />
    </main>
  );
}
