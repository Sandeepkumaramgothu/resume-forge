'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string | null;
}

export default function ApiKeyModal({ open, onClose, onSave, currentKey }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const maskedKey = currentKey
    ? `${currentKey.substring(0, 7)}...${currentKey.substring(currentKey.length - 4)}`
    : null;

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-')) {
      setError('API key must start with "sk-"');
      return;
    }
    if (trimmed.length < 20) {
      setError('API key seems too short');
      return;
    }
    setError('');
    onSave(trimmed);
    setKey('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Set OpenAI API Key">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="btn-ghost absolute top-3 right-3 rounded-lg"
          aria-label="Close modal"
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: 'var(--accent-glow)',
          }}
        >
          <Key size={24} style={{ color: 'var(--accent)' }} />
        </div>

        <h2 className="text-lg font-bold text-center mb-1">OpenAI API Key</h2>
        <p className="text-center mb-5" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Your key is stored only in this browser session and never saved to disk.
        </p>

        {maskedKey && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm flex items-center justify-between"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}>
              Current: {maskedKey}
            </span>
            <span className="badge badge-success">Active</span>
          </div>
        )}

        <div className="mb-4">
          <input
            ref={inputRef}
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="sk-..."
            className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            style={{
              background: 'var(--surface-2)',
              border: error ? '1px solid var(--error)' : '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-geist-mono)',
            }}
            id="api-key-input"
            autoComplete="off"
          />
          {error && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary w-full mb-3"
          disabled={!key.trim()}
          id="save-api-key"
        >
          Save &amp; Continue
        </button>

        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Don&apos;t have one? Get it at platform.openai.com
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
