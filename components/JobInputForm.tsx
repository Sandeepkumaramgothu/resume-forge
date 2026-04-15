'use client';

import { useState, useCallback } from 'react';
import { Rocket, Trash2, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JobInputFormProps {
  onSubmit: (jobDescription: string) => void;
  isLoading: boolean;
}

export default function JobInputForm({ onSubmit, isLoading }: JobInputFormProps) {
  const [text, setText] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const charCount = text.length;
  const isValid = charCount >= 100 && charCount <= 15_000;

  const handleSubmit = () => {
    if (!isValid || isLoading) return;
    onSubmit(text);
  };

  const handleClear = () => {
    setText('');
  };

  const handleFetchUrl = useCallback(async () => {
    const url = prompt('Enter job posting URL:');
    if (!url) return;

    setFetchingUrl(true);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setText(data.text || '');
        toast.success('Job description fetched successfully!');
      }
    } catch {
      toast.error('Failed to fetch URL. Please paste the text manually.');
    } finally {
      setFetchingUrl(false);
    }
  }, []);

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <span
            className="flex items-center justify-center rounded-md text-xs font-bold"
            style={{
              width: 24,
              height: 24,
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
            }}
          >
            1
          </span>
          Paste Job Description
        </h2>
        <div className="flex items-center gap-2">
          <span
            className="text-xs tabular-nums"
            style={{
              color: charCount > 15_000
                ? 'var(--error)'
                : charCount >= 100
                  ? 'var(--success)'
                  : 'var(--text-muted)',
            }}
          >
            {charCount.toLocaleString()} / 15,000
          </span>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full job description here... Include the role title, company name, requirements, and responsibilities for best results."
          className="textarea-main"
          disabled={isLoading}
          id="job-description-input"
          aria-label="Job description text input"
        />
        <button
          onClick={handleFetchUrl}
          disabled={isLoading || fetchingUrl}
          className="btn-ghost absolute bottom-3 right-3 rounded-md text-xs flex items-center gap-1"
          aria-label="Fetch job description from URL"
          id="fetch-url-button"
          style={{ fontSize: 12 }}
        >
          {fetchingUrl ? <Loader2 size={14} className="animate-spin-slow" /> : <Link2 size={14} />}
          {fetchingUrl ? 'Fetching...' : 'Fetch URL'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="btn btn-primary flex-1 text-[15px] py-3"
          id="generate-button"
          aria-label="Generate resume and cover letter"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin-slow" />
              Generating...
            </>
          ) : (
            <>
              <Rocket size={18} />
              Generate Resume &amp; Cover Letter
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading || !text}
          className="btn btn-secondary"
          aria-label="Clear job description"
          id="clear-button"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      {charCount > 0 && charCount < 100 && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Need at least {100 - charCount} more characters for accurate results.
        </p>
      )}
    </div>
  );
}
