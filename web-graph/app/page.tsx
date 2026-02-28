'use client';

import { useState, useCallback } from 'react';

import { bfs }                 from '../src/algorithms/bfs';
import { dfs }                 from '../src/algorithms/dfs';
import { dijkstra }            from '../src/algorithms/dijkstra';
import { connectedComponents } from '../src/algorithms/connected-components';
import { smallestThreshold }   from '../src/algorithms/union-find';
import type { StepFrame }      from '../src/algorithms/types';

import {
  parseCSV,
  graphToCytoscapeElements,
  graphFromCytoscape,
} from '../src/graph-setup/graphParser';

import { AlgorithmPanel, type AlgorithmId } from '../src/ui/algorithmPanel';
import { LogPanel }                          from '../src/ui/logPanel';
import { ControlPanel }                      from '../src/ui/controlPanel';
import { useAnimator }                       from '../src/ui/useAnimator';
import { useCytoscape }                      from '../src/ui/useCytoscape';

interface LogEntry { frame: StepFrame; index: number; }
interface Result   { value: string; success: boolean; }

export default function Home() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [result, setResult]         = useState<Result | null>(null);
  const [hasGraph, setHasGraph]     = useState(false);
  const [currentAlgoId, setCurrentAlgoId] = useState<AlgorithmId>('bfs');
  const [lastQueue, setLastQueue]         = useState<string[]>([]);

  // ── Cytoscape ──────────────────────────────────────────────────────────────
  const { containerRef, applyFrame, resetStyles, loadGraph, getCy } = useCytoscape();

  // ── Animator ──────────────────────────────────────────────────────────────
  const handleFrame = useCallback((frame: StepFrame, index: number) => {
    applyFrame(frame, index);
    if (index === -1) {
      setLogEntries([]);
      return;
    }
    if (frame.queue !== undefined) setLastQueue(frame.queue);
    setLogEntries((prev) => {
      if (index < prev.length - 1) {
        return prev.slice(0, index + 1);
      }
      return [...prev, { frame, index }];
    });
  }, [applyFrame]);

  const animator = useAnimator(handleFrame);

  // ── Load graph from CSV ────────────────────────────────────────────────────
  function handleLoadCSV(csv: string, layout: string) {
    try {
      const graph    = parseCSV(csv);
      const elements = graphToCytoscapeElements(graph);
      loadGraph(elements, layout);
      resetStyles();
      animator.stop();
      setLogEntries([]);
      setResult(null);
      setHasGraph(true);
    } catch (e) {
      console.error('[page] CSV parse error', e);
    }
  }

  // ── Clear ──────────────────────────────────────────────────────────────────
  function handleClear() {
    loadGraph([]);
    animator.stop();
    setLogEntries([]);
    setResult(null);
    setHasGraph(false);
    setLastQueue([]);
  }

  // ── Run algorithm ──────────────────────────────────────────────────────────
  function handleRun(algoId: AlgorithmId, startId: string, endId: string) {
    setCurrentAlgoId(algoId);
    const cy = getCy();
    if (!cy) { console.warn('[page] Cytoscape not yet ready'); return; }

    const graph = graphFromCytoscape(cy);
    if (graph.nodes.length === 0) { alert('Load a graph first.'); return; }

    const PATH_ALGOS = new Set(['bfs', 'dfs', 'dijkstra', 'threshold']);
    if (PATH_ALGOS.has(algoId)) {
      const ids = new Set(graph.nodes.map((n) => n.id));
      if (!ids.has(startId)) { alert(`Node "${startId}" not found.`); return; }
      if (!ids.has(endId))   { alert(`Node "${endId}" not found.`);   return; }
    }

    const algoFns = {
      bfs:        () => bfs(graph, startId, endId),
      dfs:        () => dfs(graph, startId, endId),
      dijkstra:   () => dijkstra(graph, startId, endId),
      components: () => connectedComponents(graph),
      threshold:  () => smallestThreshold(graph, startId, endId),
    };

    const algoResult = algoFns[algoId]?.();
    if (!algoResult) return;

    const answered = algoResult.answer !== undefined
      && algoResult.answer !== 'No path'
      && algoResult.answer !== 'Invalid node';
    setResult({ value: String(algoResult.answer ?? '—'), success: answered });

    resetStyles();
    setLogEntries([]);
    animator.load(algoResult.frames);
    animator.play();
  }

  return (
    <div className="flex flex-col h-screen bg-[#080a10] overflow-hidden">

      <header className="flex items-center gap-4 px-5 py-3 border-b border-[#181b28] bg-[#080a10] shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-[#4a7cf5]">GraphViz</span>
        </div>
        <span className="font-mono text-[10px] text-[#7e86a7] tracking-widest">
          Algorithm Visualizer
        </span>
        <div className="ml-auto">
          <span className="font-mono text-[9px] text-[#7e86a7] tracking-widest uppercase">
            Drag nodes to reposition · scroll to zoom
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AlgorithmPanel
          onRun={handleRun}
          onLoadCSV={handleLoadCSV}
          onClear={handleClear}
          disabled={animator.state === 'playing'}
        />

        <main className="flex-1 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(#0e0f18 1px, transparent 1px),
                linear-gradient(90deg, #0e0f18 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
          {!hasGraph && <EmptyHint />}
        </main>

        <LogPanel
          entries={logEntries}
          currentIndex={animator.currentIndex}
          frameCount={animator.frameCount}
          result={result}
          algoId={currentAlgoId}
          lastQueue={lastQueue}
        />
      </div>

      <ControlPanel
        state={animator.state}
        progress={animator.progress}
        speed={animator.speed}
        frameCount={animator.frameCount}
        onPlay={animator.play}
        onPause={animator.pause}
        onStop={animator.stop}
        onStepFwd={animator.stepForward}
        onStepBack={animator.stepBack}
        onSpeedChange={animator.setSpeed}
      />
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-3 opacity-20">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#4a7cf5" strokeWidth="1.5">
          <circle cx="8"  cy="24" r="5"/>
          <circle cx="40" cy="8"  r="5"/>
          <circle cx="40" cy="40" r="5"/>
          <circle cx="24" cy="24" r="5"/>
          <line x1="13" y1="24" x2="19" y2="24"/>
          <line x1="29" y1="24" x2="35" y2="10"/>
          <line x1="29" y1="24" x2="35" y2="38"/>
        </svg>
        <span className="font-mono text-[11px] text-[#4a7cf5] tracking-widest">
          load a graph to begin
        </span>
      </div>
    </div>
  );
}