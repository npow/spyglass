import { useState } from 'react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
  onCancel: () => void;
}

export function ApiKeyModal({ onSubmit, onCancel }: ApiKeyModalProps) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Connect to Live AIS Data</h2>
        <p>
          Enter your AISStream.io API key to view real-time ship positions worldwide.
          Get a free key at{' '}
          <a href="https://aisstream.io" target="_blank" rel="noreferrer">
            aisstream.io
          </a>.
        </p>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste your API key here..."
          autoFocus
          spellCheck={false}
        />
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!key.trim()}>
            Connect
          </button>
        </div>
      </form>
    </div>
  );
}
