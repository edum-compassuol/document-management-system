import { useRef, useState } from 'react';

import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploaded, onError }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  function resetInput() {
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || sending) {
      return;
    }

    setSending(true);

    try {
      const document = await uploadDocument(file);
      resetInput();
      onUploaded(document);
    } catch (error) {
      onError(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <input
        ref={inputRef}
        type="file"
        name="file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={sending}
      />
      <button type="submit" disabled={!file || sending}>
        {sending ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}
