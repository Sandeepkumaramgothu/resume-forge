'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Edit3, MapPin, Building2, Briefcase, Tag } from 'lucide-react';
import { toast } from 'sonner';
import hljs from 'highlight.js/lib/core';
import latex from 'highlight.js/lib/languages/latex';
import 'highlight.js/styles/github-dark.css';
import type { GeneratedResult } from '@/lib/masterResume';

// Register LaTeX language
hljs.registerLanguage('latex', latex);

interface OutputPanelProps {
  result: GeneratedResult;
}

type TabKey = 'resume' | 'coverLetter' | 'email' | 'analysis';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'resume', label: '📄 Resume LaTeX' },
  { key: 'coverLetter', label: '✉️ Cover Letter LaTeX' },
  { key: 'email', label: '📧 Email Draft' },
  { key: 'analysis', label: '🔍 Job Analysis' },
];

function CodeViewer({ code, language = 'latex' }: { code: string; language?: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  useEffect(() => {
    if (codeRef.current && !editing) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [editedCode, editing]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedCode);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [editedCode]);

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={handleCopy}
          className="btn-ghost rounded-md text-xs flex items-center gap-1 px-2.5 py-1.5"
          style={{ background: 'var(--surface-2)', fontSize: 12 }}
          aria-label="Copy code"
        >
          {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={() => setEditing(!editing)}
          className="btn-ghost rounded-md text-xs flex items-center gap-1 px-2.5 py-1.5"
          style={{
            background: editing ? 'var(--accent-glow)' : 'var(--surface-2)',
            color: editing ? 'var(--accent)' : undefined,
            fontSize: 12,
          }}
          aria-label={editing ? 'View mode' : 'Edit mode'}
        >
          <Edit3 size={13} />
          {editing ? 'View' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <textarea
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          className="w-full min-h-[400px] p-4 font-mono text-[13px] leading-relaxed outline-none resize-y"
          style={{
            background: 'var(--code-bg)',
            color: 'var(--text)',
            border: '1px solid var(--accent)',
            borderRadius: 8,
          }}
        />
      ) : (
        <div className="code-viewer">
          <pre>
            <code ref={codeRef} className={`language-${language}`}>
              {editedCode}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}

function AnalysisPanel({ meta }: { meta: GeneratedResult['meta'] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {/* Company */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          <Building2 size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Company</span>
        </div>
        <p className="font-semibold">{meta.company}</p>
        {meta.department && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {meta.department}
          </p>
        )}
      </div>

      {/* Position */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          <Briefcase size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Position</span>
        </div>
        <p className="font-semibold">{meta.jobTitle}</p>
        {meta.hiringManager && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            HM: {meta.hiringManager}
          </p>
        )}
      </div>

      {/* Location */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
        </div>
        <p className="font-semibold">{meta.location}</p>
        <div className="mt-1">
          <span className={`badge ${meta.workModality === 'Remote' ? 'badge-info' : 'badge-success'}`}>
            {meta.workModality}
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Resume Address: {meta.localAddress}
        </p>
      </div>

      {/* Keywords */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          <Tag size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Top Keywords</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meta.topKeywords?.map((kw, i) => (
            <span key={i} className="chip">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OutputPanel({ result }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('resume');

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 pt-4 pb-0">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <span
            className="flex items-center justify-center rounded-md text-xs font-bold"
            style={{
              width: 24,
              height: 24,
              background: 'rgba(34, 197, 94, 0.15)',
              color: 'var(--success)',
            }}
          >
            2
          </span>
          Your Tailored Documents
        </h2>
      </div>

      {/* Tabs */}
      <div className="tabs-list px-5 mt-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="tab-trigger"
            data-state={activeTab === tab.key ? 'active' : 'inactive'}
            id={`tab-${tab.key}`}
            aria-label={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === 'resume' && (
          <CodeViewer code={result.resumeTex} language="latex" />
        )}
        {activeTab === 'coverLetter' && (
          <CodeViewer code={result.coverLetterTex} language="latex" />
        )}
        {activeTab === 'email' && (
          <CodeViewer code={result.emailDraft} language="plaintext" />
        )}
        {activeTab === 'analysis' && <AnalysisPanel meta={result.meta} />}
      </div>
    </div>
  );
}
