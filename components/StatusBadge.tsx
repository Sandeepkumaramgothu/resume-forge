'use client';

import { Settings2, PenTool, Wrench, CheckCircle2 } from 'lucide-react';
import type { AppState } from '@/lib/masterResume';

interface StatusBadgeProps {
  state: AppState;
}

const STEPS = [
  { key: 'analyzing', icon: Settings2, label: 'Analyzing', desc: 'Reading job description and extracting keywords...' },
  { key: 'writing', icon: PenTool, label: 'Writing', desc: 'Tailoring your resume with ATS-optimized language...' },
  { key: 'compiling', icon: Wrench, label: 'Compiling', desc: 'Converting LaTeX to PDF...' },
  { key: 'ready', icon: CheckCircle2, label: 'Ready', desc: 'Your documents are ready to download!' },
] as const;

function getActiveStep(state: AppState): number {
  switch (state) {
    case 'GENERATING':
      return 1; // We animate from 0→1 during generation
    case 'COMPILING':
      return 2;
    case 'READY':
      return 3;
    default:
      return -1;
  }
}

export default function StatusBadge({ state }: StatusBadgeProps) {
  const activeStep = getActiveStep(state);

  if (activeStep < 0) return null;

  return (
    <div className="card p-5 animate-slide-up" aria-live="polite" role="status">
      {/* Progress bar */}
      <div className="progress-track mb-5">
        <div
          className="progress-fill"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          const isPending = i > activeStep;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center text-center gap-2 rounded-lg p-3 transition-all"
              style={{
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                opacity: isPending ? 0.35 : 1,
              }}
            >
              <div
                className={`flex items-center justify-center rounded-full transition-all ${
                  isActive ? 'animate-progress-pulse' : ''
                }`}
                style={{
                  width: 36,
                  height: 36,
                  background: isDone
                    ? 'rgba(34, 197, 94, 0.15)'
                    : isActive
                      ? 'var(--accent-glow)'
                      : 'var(--surface-2)',
                  color: isDone
                    ? 'var(--success)'
                    : isActive
                      ? 'var(--accent)'
                      : 'var(--text-muted)',
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span
                className="text-xs font-semibold"
                style={{
                  color: isDone
                    ? 'var(--success)'
                    : isActive
                      ? 'var(--accent)'
                      : 'var(--text-muted)',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Description */}
      <p
        className="text-center text-sm mt-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {STEPS[activeStep]?.desc}
      </p>
    </div>
  );
}
