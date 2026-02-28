'use client';

import type { AnimatorState } from './useAnimator';

interface ControlBarProps {
  state:        AnimatorState;
  progress:     number;    // 0–1
  speed:        number;    // ms
  frameCount:   number;
  onPlay:       () => void;
  onPause:      () => void;
  onStop:       () => void;
  onStepFwd:    () => void;
  onStepBack:   () => void;
  onSpeedChange:(ms: number) => void;
}

const SPEEDS = [
  { label: '0.25x', ms: 1600 },
  { label: '0.5x',  ms: 1200 },
  { label: '1x',    ms: 800  },
  { label: '2x',    ms: 400  },
  { label: '4x',    ms: 200  },
];

export function ControlPanel({
  state, progress, speed, frameCount,
  onPlay, onPause, onStop, onStepFwd, onStepBack, onSpeedChange,
}: ControlBarProps) {
  const isPlaying  = state === 'playing';
  const hasFrames  = frameCount > 0;
  const isDone     = state === 'done';

  function handlePlayPause() {
    if (isPlaying) onPause();
    else onPlay();
  }

  const currentSpeedLabel = SPEEDS.find((s) => s.ms === speed)?.label ?? '1×';

  return (
    <footer className="flex items-center gap-3 px-5 py-3 border-t border-[#181b28] bg-[#080a10] shrink-0">

      {/* ── Transport buttons ── */}
      <div className="flex items-center gap-1">
        {/* Step back */}
        <CtrlBtn onClick={onStepBack} disabled={!hasFrames || state === 'idle'} title="Step back">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 2h1.5v8H2V2zm7.5 0L4 6l5.5 4V2z"/>
          </svg>
        </CtrlBtn>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          disabled={!hasFrames || isDone}
          title={isPlaying ? 'Pause' : isDone ? 'Done' : 'Play'}
          className={[
            'flex items-center justify-center w-9 h-9 font-mono text-sm transition-colors duration-100',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            isPlaying
              ? 'bg-[#4a7cf5] text-white hover:bg-[#6a95f8]'
              : 'bg-[#0e1a38] border border-[#2a4a9e] text-[#4a7cf5] hover:bg-[#142050]',
          ].join(' ')}
        >
          {isPlaying ? (
            // Pause icon
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
              <rect x="0" y="0" width="4" height="12" rx="1"/>
              <rect x="7" y="0" width="4" height="12" rx="1"/>
            </svg>
          ) : (
            // Play icon
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
              <path d="M0 0l11 6-11 6V0z"/>
            </svg>
          )}
        </button>

        {/* Step forward */}
        <CtrlBtn onClick={onStepFwd} disabled={!hasFrames || isDone} title="Step forward">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M8.5 2H10v8H8.5V2zM2 2l5.5 4L2 10V2z"/>
          </svg>
        </CtrlBtn>

        {/* Stop */}
        <CtrlBtn onClick={onStop} disabled={!hasFrames} title="Stop / Reset">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect width="10" height="10" rx="1"/>
          </svg>
        </CtrlBtn>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="w-full h-[2px] bg-[#0e0f18] relative">
          <div
            className="absolute inset-y-0 left-0 bg-[#4a7cf5] transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* ── Speed selector ── */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-[9px] text-[#2e3347] uppercase tracking-widest">Speed</span>
        <div className="flex gap-px">
          {SPEEDS.map((s) => (
            <button
              key={s.ms}
              onClick={() => onSpeedChange(s.ms)}
              className={[
                'font-mono text-[9px] px-1.5 py-1 transition-colors duration-100',
                speed === s.ms
                  ? 'bg-[#4a7cf5] text-white'
                  : 'bg-[#0c0e18] border border-[#181b28] text-[#2e3347] hover:text-[#6a7090]',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-[#181b28]">
        <LegendDot color="border-[#4a7cf5] bg-[#1a3a6e]"  label="active"  />
        <LegendDot color="border-[#2ea86a] bg-[#0d2e1e]"  label="visited" />
        <LegendDot color="border-[#e8960a] bg-[#3d2800]"  label="path"    />
      </div>

    </footer>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CtrlBtn({ onClick, disabled, title, children }: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center justify-center w-8 h-8 bg-[#0c0e18] border border-[#181b28] text-[#3a3f55] hover:text-[#7aaaf8] hover:border-[#2a3a6e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-100"
    >
      {children}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full border-2 ${color}`} />
      <span className="font-mono text-[9px] text-[#2e3347]">{label}</span>
    </div>
  );
}