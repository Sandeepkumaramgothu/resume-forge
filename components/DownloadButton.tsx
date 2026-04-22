'use client';

import { useState } from 'react';
import { Download, ExternalLink, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedResult } from '@/lib/masterResume';

interface DownloadButtonProps {
  result: GeneratedResult;
}

/**
 * Cross-browser reliable file download using a temporary anchor element
 * appended to the DOM. This approach works in all modern browsers
 * including Safari which blocks programmatic clicks on detached elements.
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Delay cleanup to ensure download starts
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 250);
}

export default function DownloadButton({ result }: DownloadButtonProps) {
  const [compilingResume, setCompilingResume] = useState(false);
  const [compilingCover, setCompilingCover] = useState(false);

  const downloadPDF = async (type: 'resume' | 'coverLetter') => {
    const isResume = type === 'resume';
    const setter = isResume ? setCompilingResume : setCompilingCover;
    const latexCode = isResume ? result.resumeTex : result.coverLetterTex;
    const filename = isResume ? result.meta.resumeFilename : result.meta.coverLetterFilename;
    const label = isResume ? 'Resume' : 'Cover Letter';

    setter(true);
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latexCode, filename }),
      });

      const contentType = res.headers.get('Content-Type') || '';

      if (res.ok && contentType.includes('application/pdf')) {
        // Success — download the PDF
        const blob = await res.blob();
        triggerDownload(blob, `${filename}.pdf`);
        toast.success(`${label} PDF downloaded!`);
      } else {
        // Compilation failed — try to get error, fall back to .tex download
        let errorMsg = 'LaTeX compilation failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // Response wasn't JSON
        }

        console.warn(`[DownloadButton] Compile failed: ${errorMsg}`);

        // Fallback: download .tex file
        const texBlob = new Blob([latexCode], { type: 'application/x-tex' });
        triggerDownload(texBlob, `${filename}.tex`);
        toast.warning(
          `PDF compilation failed — downloaded .tex file instead. Open in Overleaf to compile.\n\nError: ${errorMsg}`,
          { duration: 8000 }
        );
      }
    } catch (err) {
      console.error('[DownloadButton] Network error:', err);

      // Last resort: download raw .tex
      const texBlob = new Blob([latexCode], { type: 'application/x-tex' });
      triggerDownload(texBlob, `${filename}.tex`);
      toast.error('Network error during compilation. Downloaded .tex file as fallback — open in Overleaf.');
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
