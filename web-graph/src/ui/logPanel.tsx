'use client';

import { useEffect, useRef } from 'react';
import type { StepFrame, StepCategory } from '../algorithms/types';

const CATEGORY_COLOUR: Record<StepCategory, string> = {
  init:    'border-[#2e3347]',
  visit:   'border-[#4a7cf5]',
  explore: 'border-[#2a3a6e]',
  relax:   'border-[#7a5010]',
  union:   'border-[#7a5010]',
  found:   'border-[#e8960a]',
  done:    'border-[#2ea86a]',
};

const CATEGORY_TEXT: Record<StepCategory, string> = {
  init:    'text-[#3a3f55]',
  visit:   'text-[#7aaaf8]',
  explore: 'text-[#4a5580]',
  relax:   'text-[#c87a20]',
  union:   'text-[#c87a20]',
  found:   'text-[#e8960a]',
  done:    'text-[#2ea86a]',
};

// Label shown in the queue panel header per algorithm
const ALGO_QUEUE_LABEL: Record<string, string> = {
  bfs:       'Queue',
  dfs:       'Stack',
  dijkstra:  'Priority Queue',
  threshold: 'Edges',
};

interface LogEntry { frame: StepFrame; index: number; }
interface Result   { value: string; success: boolean; }

interface LogPanelProps {
  entries:      LogEntry[];
  currentIndex: number;
  frameCount:   number;
  result:       Result | null;
  algoId:       string;   // so we can label the queue correctly
}

export function LogPanel({ entries, currentIndex, frameCount, result, algoId }: LogPanelProps) {
  const bottomRef  = useRef<HTMLDivElement>(null);
  const currentFrame = entries.find((e) => e.index === currentIndex)?.frame ?? null;
  const queue = currentFrame?.queue ?? [];
  const queueLabel = ALGO_QUEUE_LABEL[algoId] ?? 'Queue';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [entries.length]);

  return (
    <aside className="flex flex-col w-[260px] shrink-0 border-l border-[#181b28] bg-[#080a10]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#181b28] shrink-0">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#2e3347]">Log</span>
        <span className="font-mono text-[10px] text-[#4a7cf5]">
          {frameCount > 0 ? `${currentIndex + 1} / ${frameCount}` : '—'}
        </span>
      </div>

      {/* Result banner */}
      {result && (
        <div className={[
          'shrink-0 px-4 py-2.5 border-b border-[#181b28] font-mono text-[11px] flex items-center gap-2',
          result.success ? 'text-[#2ea86a]' : 'text-[#e05c7a]',
        ].join(' ')}>
          <span className="text-[#2e3347]">answer</span>
          <span className="text-[#2e3347]">=</span>
          <span className="font-semibold">{result.value}</span>
        </div>
      )}

      {/* ── Queue / Stack panel ── */}
      {frameCount > 0 && (
        <div className="shrink-0 border-b border-[#181b28]">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#2e3347]">
              {queueLabel}
            </span>
            <span className="font-mono text-[10px] text-[#2e3347]">
              {queue.length > 0 ? `${queue.length} item${queue.length !== 1 ? 's' : ''}` : 'empty'}
            </span>
          </div>

          <div className="px-3 pb-3 flex flex-wrap gap-1 min-h-[32px]">
            {queue.length === 0 ? (
              <span className="font-mono text-[9px] text-[#1e2130] italic">—</span>
            ) : (
              queue.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  {/* Front-of-queue marker */}
                  {i === 0 && (
                    <span className="font-mono text-[8px] text-[#4a7cf5] uppercase">▶</span>
                  )}
                  <span className={[
                    'font-mono text-[10px] px-2 py-0.5 border',
                    i === 0
                      ? 'bg-[#0e1a38] border-[#2a4a9e] text-[#7aaaf8]'  // front = highlighted
                      : 'bg-[#0c0e18] border-[#181b28] text-[#3a3f55]', // rest = muted
                  ].join(' ')}>
                    {item}
                  </span>
                  {/* Separator between items */}
                  {i < queue.length - 1 && (
                    <span className="font-mono text-[8px] text-[#1e2130]">→</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step log */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-[2px]">
        {entries.length === 0 && (
          <div className="font-mono text-[10px] text-[#2e3347] px-2 py-4 text-center">
            Run an algorithm to see the step log.
          </div>
        )}

        {entries.map(({ frame, index }) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={index}
              className={[
                'flex flex-col gap-1 px-2 py-1.5 border-l-2 transition-colors duration-100',
                CATEGORY_COLOUR[frame.category],
                isCurrent ? 'bg-[#0c0e18]' : 'bg-transparent',
              ].join(' ')}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[9px] text-[#2e3347] shrink-0 tabular-nums">
                  {String(index + 1).padStart(3, '0')}
                </span>
                <span className={['font-mono text-[10px] leading-relaxed', CATEGORY_TEXT[frame.category]].join(' ')}>
                  {frame.log ?? ''}
                </span>
              </div>

              {isCurrent && frame.metadata && Object.keys(frame.metadata).length > 0 && (
                <div className="ml-7 flex flex-wrap gap-x-3 gap-y-0.5">
                  {Object.entries(frame.metadata).map(([k, v]) => (
                    <span key={k} className="font-mono text-[9px] text-[#2e3347]">
                      <span className="text-[#2a3a5e]">{k}</span>
                      <span className="text-[#1e2130]">=</span>
                      <span className="text-[#3a5a3e]">{String(v)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </aside>
  );
}