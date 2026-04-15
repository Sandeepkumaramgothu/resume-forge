'use client';

import { Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
}

export default function Header({ onOpenApiKeyModal }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: 'rgba(var(--bg), 0.8)',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#00b4a0" />
            <path
              d="M8 10h10M8 16h7M8 22h10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M22 14l3 3-3 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="gradient-text">ResumeForge</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>AI</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenApiKeyModal}
            className="btn-ghost rounded-lg"
            aria-label="API Key Settings"
            id="api-key-settings"
          >
            <Settings size={18} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
