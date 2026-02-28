'use client';

import { useState, useRef } from 'react';

export type AlgorithmId = 'bfs' | 'dfs' | 'dijkstra' | 'components' | 'threshold';

const ALGORITHMS: { id: AlgorithmId; label: string; needsPath: boolean; description: string }[] = [
  { id: 'bfs',        label: 'BFS',          needsPath: true,  description: 'Shortest unweighted path' },
  { id: 'dfs',        label: 'DFS',          needsPath: true,  description: 'Depth-first traversal' },
  { id: 'dijkstra',   label: 'Dijkstra',     needsPath: true,  description: 'Shortest weighted path' },
  { id: 'components', label: 'Components',   needsPath: false, description: 'Connected components' },
  { id: 'threshold',  label: 'Min Threshold',needsPath: true,  description: 'Smallest connecting weight' },
];

export interface AlgorithmPanelProps {
  onRun:     (algo: AlgorithmId, start: string, end: string) => void;
  onLoadCSV: (csv: string, layout: string) => void;
  onClear:   () => void;
  disabled:  boolean;
}

export function AlgorithmPanel({ onRun, onLoadCSV, onClear, disabled }: AlgorithmPanelProps) {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>('bfs');
  const [startNode, setStartNode]       = useState('');
  const [endNode, setEndNode]           = useState('');
  const [startError, setStartError]     = useState('');
  const [endError, setEndError]         = useState('');
  const [csvText, setCsvText]           = useState('A,B,4\nA,C,2\nB,C,1\nB,D,5\nC,D,8\nC,E,10\nD,E,2\nD,F,6\nE,F,3');
  const [layout, setLayout]             = useState('cose');
  const [csvError, setCsvError]         = useState('');

  const startRef = useRef<HTMLInputElement>(null);
  const endRef   = useRef<HTMLInputElement>(null);

  const currentAlgo = ALGORITHMS.find((a) => a.id === selectedAlgo)!;

  function handleAlgoSelect(id: AlgorithmId) {
    setSelectedAlgo(id);
    setStartError('');
    setEndError('');
  }

  function handleRun() {
    setStartError('');
    setEndError('');

    if (currentAlgo.needsPath) {
      // Validate — show inline error and focus the offending field
      if (!startNode.trim()) {
        setStartError('Enter a start node');
        startRef.current?.focus();
        return;
      }
      if (!endNode.trim()) {
        setEndError('Enter an end node');
        endRef.current?.focus();
        return;
      }
    }

    onRun(selectedAlgo, startNode.trim(), endNode.trim());
  }

  function handleLoadCSV() {
    setCsvError('');
    if (!csvText.trim()) { setCsvError('CSV is empty.'); return; }
    onLoadCSV(csvText, layout);
  }

  return (
    <aside className="flex flex-col w-[240px] shrink-0 border-r border-[#181b28] bg-[#080a10] overflow-y-auto">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#181b28]">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#2e3347]">Algorithm</span>
      </div>

      {/* Algorithm picker */}
      <div className="px-3 py-3 border-b border-[#181b28] flex flex-col gap-1">
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.id}
            onClick={() => handleAlgoSelect(algo.id)}
            className={[
              'flex items-start gap-2 px-3 py-2 text-left transition-colors duration-100 border rounded-none',
              selectedAlgo === algo.id
                ? 'bg-[#0e1a38] border-[#2a4a9e] text-[#7aaaf8]'
                : 'bg-transparent border-transparent text-[#3a3f55] hover:text-[#8890aa] hover:bg-[#0e0f18]',
            ].join(' ')}
          >
            <span className="font-mono text-[11px] font-semibold min-w-[80px] mt-px leading-tight">
              {algo.label}
            </span>
            <span className="font-mono text-[9px] text-[#2e3347] leading-tight mt-[2px]">
              {algo.description}
            </span>
          </button>
        ))}
      </div>

      {/* Start / end inputs */}
      {currentAlgo.needsPath && (
        <div className="px-3 py-3 border-b border-[#181b28] flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#2e3347]">
            Source / Target
          </span>
          <div className="flex gap-2">
            {/* Start */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-mono text-[9px] text-[#2e3347] uppercase tracking-widest">From</label>
              <input
                ref={startRef}
                value={startNode}
                onChange={(e) => { setStartNode(e.target.value); setStartError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                placeholder="e.g. A"
                className={[
                  'bg-[#0c0e18] border text-[#c8cde0] font-mono text-[12px] px-2 py-1.5 w-full outline-none transition-colors',
                  startError ? 'border-[#e05c7a]' : 'border-[#1e2130] focus:border-[#4a7cf5]',
                ].join(' ')}
              />
              {startError && (
                <span className="font-mono text-[9px] text-[#e05c7a]">{startError}</span>
              )}
            </div>
            {/* End */}
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-mono text-[9px] text-[#2e3347] uppercase tracking-widest">To</label>
              <input
                ref={endRef}
                value={endNode}
                onChange={(e) => { setEndNode(e.target.value); setEndError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                placeholder="e.g. F"
                className={[
                  'bg-[#0c0e18] border text-[#c8cde0] font-mono text-[12px] px-2 py-1.5 w-full outline-none transition-colors',
                  endError ? 'border-[#e05c7a]' : 'border-[#1e2130] focus:border-[#4a7cf5]',
                ].join(' ')}
              />
              {endError && (
                <span className="font-mono text-[9px] text-[#e05c7a]">{endError}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Run button */}
      <div className="px-3 py-3 border-b border-[#181b28]">
        <button
          onClick={handleRun}
          disabled={disabled}
          className="w-full font-mono text-[11px] font-semibold tracking-widest uppercase px-3 py-2.5 bg-[#4a7cf5] text-white hover:bg-[#6a95f8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-100"
        >
          ▶ Run
        </button>
      </div>

      {/* CSV import */}
      <div className="px-3 py-3 border-b border-[#181b28] flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#2e3347]">Load CSV</span>
        <span className="font-mono text-[9px] text-[#2e3347]">format: nodeA,nodeB,weight</span>
        <textarea
          value={csvText}
          onChange={(e) => { setCsvText(e.target.value); setCsvError(''); }}
          rows={6}
          spellCheck={false}
          className="bg-[#0c0e18] border border-[#1e2130] text-[#6a7090] font-mono text-[10px] px-2 py-2 w-full outline-none focus:border-[#4a7cf5] resize-y transition-colors leading-relaxed"
        />
        {csvError && <span className="font-mono text-[9px] text-[#e05c7a]">{csvError}</span>}
        <div className="flex gap-2 items-center">
          <span className="font-mono text-[9px] text-[#2e3347] shrink-0">Layout</span>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="flex-1 bg-[#0c0e18] border border-[#1e2130] text-[#6a7090] font-mono text-[10px] px-2 py-1 outline-none focus:border-[#4a7cf5] transition-colors"
          >
            <option value="cose">Force</option>
            <option value="circle">Circle</option>
            <option value="grid">Grid</option>
            <option value="breadthfirst">Tree</option>
          </select>
        </div>
        <button
          onClick={handleLoadCSV}
          className="w-full font-mono text-[10px] tracking-widest uppercase px-3 py-2 bg-[#0c0e18] border border-[#1e2130] text-[#6a7090] hover:border-[#4a7cf5] hover:text-[#c8cde0] transition-colors duration-100"
        >
          Load Graph
        </button>
      </div>

      {/* Clear */}
      <div className="px-3 py-3 mt-auto">
        <button
          onClick={onClear}
          className="w-full font-mono text-[10px] tracking-widest uppercase px-3 py-2 bg-transparent border border-[#181b28] text-[#2e3347] hover:border-[#e05c7a] hover:text-[#e05c7a] transition-colors duration-100"
        >
          Clear Graph
        </button>
      </div>
    </aside>
  );
}