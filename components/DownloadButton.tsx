'use client';

import { useState } from 'react';
import { Download, ExternalLink, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedResult } from '@/lib/masterResume';

interface DownloadButtonProps {
  result: GeneratedResult;
}

export default function DownloadButton({ result }: DownloadButtonProps) {
  const [compilingResume, setCompilingResume] = useState(false);
  const [compilingCover, setCompilingCover] = useState(false);

  const downloadPDF = async (type: 'resume' | 'coverLetter') => {
    const isResume = type === 'resume';
    const setter = isResume ? setCompilingResume : setCompilingCover;
    const latexCode = isResume ? result.resumeTex : result.coverLetterTex;
    const filename = isResume ? result.meta.resumeFilename : result.meta.coverLetterFilename;

    setter(true);
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latexCode, filename }),
      });

      if (res.headers.get('Content-Type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${isResume ? 'Resume' : 'Cover Letter'} PDF downloaded!`);
      } else {
        // Fallback: download .tex file
        const data = await res.json();
        const blob = new Blob([data.latexCode || latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.tex`;
        a.click();
        URL.revokeObjectURL(url);
        toast.warning('PDF compile failed. Downloaded .tex file instead — open in Overleaf to compile.');
      }
    } catch {
      // Last resort: download raw .tex
      const blob = new Blob([latexCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      toast.error('Download failed. Saved .tex file as fallback.');
    } finally {
      setter(false);
    }
  };

  const openInOverleaf = (latexCode: string) => {
    const encoded = encodeURIComponent(latexCode);
    window.open(`https://www.overleaf.com/docs?snip=${encoded}`, '_blank');
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(result.emailDraft);
      toast.success('Email draft copied to clipboard!');
    } catch {
      toast.error('Failed to copy email');
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
        Download &amp; Share
      </h3>

      {/* Primary downloads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => downloadPDF('resume')}
          disabled={compilingResume}
          className="btn btn-download"
          id="download-resume-pdf"
          aria-label="Download Resume PDF"
        >
          {compilingResume ? (
            <Loader2 size={18} className="animate-spin-slow" />
          ) : (
            <Download size={18} />
          )}
          {compilingResume ? 'Compiling...' : 'Download Resume PDF'}
        </button>

        <button
          onClick={() => downloadPDF('coverLetter')}
          disabled={compilingCover}
          className="btn btn-download"
          id="download-cover-pdf"
          aria-label="Download Cover Letter PDF"
        >
          {compilingCover ? (
            <Loader2 size={18} className="animate-spin-slow" />
          ) : (
            <Download size={18} />
          )}
          {compilingCover ? 'Compiling...' : 'Download Cover Letter PDF'}
        </button>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => openInOverleaf(result.resumeTex)}
          className="btn btn-secondary text-sm"
          id="overleaf-resume"
          aria-label="Open resume in Overleaf"
        >
          <ExternalLink size={15} />
          Resume → Overleaf
        </button>
        <button
          onClick={() => openInOverleaf(result.coverLetterTex)}
          className="btn btn-secondary text-sm"
          id="overleaf-cover"
          aria-label="Open cover letter in Overleaf"
        >
          <ExternalLink size={15} />
          Cover → Overleaf
        </button>
        <button
          onClick={copyEmail}
          className="btn btn-secondary text-sm"
          id="copy-email"
          aria-label="Copy email draft to clipboard"
        >
          <Mail size={15} />
          Copy Email
        </button>
      </div>
    </div>
  );
}
