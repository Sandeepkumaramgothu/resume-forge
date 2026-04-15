'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import ApiKeyModal from '@/components/ApiKeyModal';
import JobInputForm from '@/components/JobInputForm';
import StatusBadge from '@/components/StatusBadge';
import OutputPanel from '@/components/OutputPanel';
import DownloadButton from '@/components/DownloadButton';
import type { GeneratedResult, AppState } from '@/lib/masterResume';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lastJobDescription, setLastJobDescription] = useState('');

  // Check if server has API key, and load session key
  useEffect(() => {
    const storedKey = sessionStorage.getItem('oai_key');
    if (storedKey) setApiKey(storedKey);

    fetch('/api/check-key')
      .then((res) => res.json())
      .then((data) => {
        if (!data.hasKey && !storedKey) {
          setShowApiModal(true);
        }
      })
      .catch(() => {
        // Silently fail — user can set key manually
      });
  }, []);

  const handleSaveApiKey = useCallback((key: string) => {
    sessionStorage.setItem('oai_key', key);
    setApiKey(key);
    toast.success('API key saved for this session');
  }, []);

  const handleGenerate = useCallback(
    async (jobDescription: string) => {
      // Check for API key
      const storedKey = apiKey || sessionStorage.getItem('oai_key');
      if (!storedKey) {
        // Check server-side key
        try {
          const checkRes = await fetch('/api/check-key');
          const checkData = await checkRes.json();
          if (!checkData.hasKey) {
            setShowApiModal(true);
            toast.error('Please set your OpenAI API key first');
            return;
          }
        } catch {
          setShowApiModal(true);
          return;
        }
      }

      setAppState('GENERATING');
      setErrorMessage('');
      setResult(null);
      setLastJobDescription(jobDescription);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription,
            apiKey: storedKey || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Server error (${res.status})`);
        }

        // Validate response structure
        if (!data.meta || !data.resumeTex || !data.coverLetterTex) {
          throw new Error('Incomplete response from AI. Please try again.');
        }

        setResult(data as GeneratedResult);
        setAppState('READY');
        toast.success('Documents generated successfully!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setErrorMessage(message);
        setAppState('ERROR_AI');
        toast.error(message);
      }
    },
    [apiKey]
  );

  const handleRetry = () => {
    if (lastJobDescription) {
      handleGenerate(lastJobDescription);
    }
  };

  const isLoading = appState === 'GENERATING' || appState === 'COMPILING';

  return (
    <>
      <Header onOpenApiKeyModal={() => setShowApiModal(true)} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Hero description */}
        <div className="text-center mb-2 animate-fade-in">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Paste a job description → Get an ATS-optimized LaTeX resume, cover letter &amp; email — powered by GPT-4o
          </p>
        </div>

        {/* Step 1: Input */}
        <JobInputForm onSubmit={handleGenerate} isLoading={isLoading} />

        {/* Progress */}
        {(appState === 'GENERATING' || appState === 'COMPILING' || appState === 'READY') && (
          <StatusBadge state={appState} />
        )}

        {/* Error */}
        {(appState === 'ERROR_AI' || appState === 'ERROR_COMPILE') && (
          <div
            className="card p-5 animate-fade-in flex items-start gap-3"
            style={{ borderColor: 'var(--error)' }}
          >
            <AlertTriangle
              size={20}
              style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}
            />
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--error)' }}>
                {appState === 'ERROR_AI' ? 'Generation Failed' : 'Compilation Failed'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {errorMessage}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="btn btn-secondary text-sm"
              aria-label="Retry generation"
            >
              <RotateCcw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Step 2: Output */}
        {result && appState === 'READY' && (
          <>
            <OutputPanel result={result} />
            <DownloadButton result={result} />
          </>
        )}

        {/* Footer */}
        <footer className="text-center py-6 mt-auto">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/sandeepkumaramgothu/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Sandeep Kumar Amgothu
            </a>{' '}
            · ResumeForge AI v1.0
          </p>
        </footer>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        open={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </>
  );
}
