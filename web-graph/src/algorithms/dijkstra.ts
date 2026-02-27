import type { Graph, AlgorithmResult, StepFrame } from './types';

export function dijkstra(
  graph:   Graph,
  startId: string,
  endId:   string,
): AlgorithmResult {
  const frames: StepFrame[] = [];

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!graph.adj.has(startId) || !graph.adj.has(endId)) {
    return {
      frames: [{
        activeNodes: [], visitedNodes: [], activeEdges: [], pathEdges: [],
        log: `Error: node "${!graph.adj.has(startId) ? startId : endId}" not found.`,
        category: 'done',
      }],
      answer: 'Invalid node',
    };
  }

  // ── Initialise distance map ───────────────────────────────────────────────
  const dist     = new Map<string, number>();
  const prev     = new Map<string, string | null>();
  const prevEdge = new Map<string, string | null>();
  const settled  = new Set<string>();

  for (const { id } of graph.nodes) {
    dist.set(id, Infinity);
    prev.set(id, null);
    prevEdge.set(id, null);
  }
  dist.set(startId, 0);

  // ── Priority queue (binary min-heap) ─────────────────────────────────────
  const pq = new MinHeap<{ id: string; cost: number }>((a, b) => a.cost - b.cost);
  pq.push({ id: startId, cost: 0 });

  frames.push({
    activeNodes:  [startId],
    visitedNodes: [],
    activeEdges:  [],
    pathEdges:    [],
    log:      `Init: dist[${startId}] = 0; all others = ∞. Push ${startId} to priority queue.`,
    category:     'init',
    metadata:     distSnapshot(dist, graph),
  });

  // ── Main loop ─────────────────────────────────────────────────────────────
  while (!pq.isEmpty()) {
    const { id: u, cost } = pq.pop()!;

    // Lazy deletion: skip stale entries
    if (settled.has(u)) continue;
    settled.add(u);

    frames.push({
      activeNodes:  [u],
      visitedNodes: [...settled],
      activeEdges:  [],
      pathEdges:    [],
      log:      `Settle ${u} (dist = ${cost}). Pop from priority queue.`,
      category:     'visit',
      metadata:     distSnapshot(dist, graph),
    });

    // Early exit: once endId is settled its distance is final
    if (u === endId) break;

    for (const { neighbor, weight, edgeId } of graph.adj.get(u)!) {
      if (settled.has(neighbor)) continue;

      const newDist = dist.get(u)! + weight;
      const oldDist = dist.get(neighbor)!;

      frames.push({
        activeNodes:  [u, neighbor],
        visitedNodes: [...settled],
        activeEdges:  [edgeId],
        pathEdges:    [],
        log:      `Examine edge ${u} → ${neighbor} (w = ${weight}). `
          + `Candidate dist: ${cost} + ${weight} = ${newDist} `
          + `vs current ${oldDist === Infinity ? '∞' : oldDist}.`,
        category:     'explore',
        metadata:     distSnapshot(dist, graph),
      });

      if (newDist < oldDist) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, u);
        prevEdge.set(neighbor, edgeId);
        pq.push({ id: neighbor, cost: newDist });

        frames.push({
          activeNodes:  [neighbor],
          visitedNodes: [...settled],
          activeEdges:  [edgeId],
          pathEdges:    [],
          log:      `Relax: dist[${neighbor}] ${oldDist === Infinity ? '∞' : oldDist} → ${newDist}. Push to queue.`,
          category:     'relax',
          metadata:     distSnapshot(dist, graph),
        });
      } else {
        frames.push({
          activeNodes:  [neighbor],
          visitedNodes: [...settled],
          activeEdges:  [edgeId],
          pathEdges:    [],
          log:      `No improvement for ${neighbor} — skip.`,
          category:     'explore',
          metadata:     distSnapshot(dist, graph),
        });
      }
    }
  }

  const { path, pathEdgeIds } = reconstructPath(endId, startId, prev, prevEdge);
  const pathFound = path[0] === startId;
  const totalDist = dist.get(endId)!;

  frames.push({
    activeNodes:  pathFound ? path : [],
    visitedNodes: [...settled],
    activeEdges:  [],
    pathEdges:    pathFound ? pathEdgeIds : [],
    log:      pathFound
      ? `Shortest weighted path: ${path.join(' → ')} (total weight = ${totalDist})`
      : `No path from ${startId} to ${endId}.`,
    category: 'done',
    metadata: distSnapshot(dist, graph),
  });

  return {
    frames,
    path:   pathFound ? path : undefined,
    answer: pathFound ? totalDist : 'No path',
  };
}

// Distance snapshot for metadata panel
function distSnapshot(
  dist:  Map<string, number>,
  graph: Graph,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const { id } of graph.nodes) {
    const d = dist.get(id) ?? Infinity;
    out[`dist[${id}]`] = d === Infinity ? '∞' : d;
  }
  return out;
}

export function reconstructPath(
  endId:    string,
  startId:  string,
  prev:     Map<string, string | null>,
  prevEdge: Map<string, string | null>,
): { path: string[]; pathEdgeIds: string[] } {
  const path: string[]       = [];
  const pathEdgeIds: string[] = [];

  let cur: string | null = endId;
  while (cur !== null && prev.has(cur)) {
    path.unshift(cur);
    const edgeId = prevEdge.get(cur);
    if (edgeId) pathEdgeIds.unshift(edgeId);
    cur = prev.get(cur) ?? null;
  }

  // path[0] === startId means we reached the start — a valid path
  return { path, pathEdgeIds };
}


// MinHeap implementation for Dijkstra's algorithm
class MinHeap<T> {
  private data: T[] = [];
  private cmp: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.cmp = comparator;
  }

  push(item: T): void {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  isEmpty(): boolean { return this.data.length === 0; }
  size():    number  { return this.data.length; }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.cmp(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  private _siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.cmp(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}