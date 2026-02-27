import type { Graph, AlgorithmResult, StepFrame } from './types';

/**
 * Smallest Threshold — Union-Find (Disjoint Set)
 *
 * Finds the smallest edge weight T such that all edges with weight ≤ T
 * form a connected path from startId to endId.
 *
 * Algorithm:
 *   1. Sort all edges by weight ascending.
 *   2. Use Union-By-Size to merge components one edge at a time.
 *   3. Stop as soon as startId and endId share a root — that edge's
 *      weight is the answer.
 */
export function smallestThreshold(
  graph:   Graph,
  startId: string,
  endId:   string,
): AlgorithmResult {
  const frames: StepFrame[] = [];

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

  if (startId === endId) {
    return {
      frames: [{
        activeNodes: [startId], visitedNodes: [], activeEdges: [], pathEdges: [],
        log: `Start and end are the same node — threshold is 0.`,
        category: 'done',
      }],
      answer: 0,
    };
  }

  const uf = new UnionFind(graph.nodes.map((n) => n.id));

  // Sort edges by weight ascending
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);

  frames.push({
    activeNodes:  [],
    visitedNodes: [],
    activeEdges:  [],
    pathEdges:    [],
    log:      `Find smallest threshold to connect ${startId} ↔ ${endId}. `
      + `${sortedEdges.length} edges sorted by weight ascending.`,
    category:     'init',
    metadata:     uf.snapshot(),
  });

  // Process edges in order
  for (const edge of sortedEdges) {
    // Already connected — stop early
    if (uf.connected(startId, endId)) break;

    const { source, target, weight, id: edgeId } = edge;
    const rootSrc = uf.find(source);
    const rootTgt = uf.find(target);

    if (rootSrc === rootTgt) {
      // Same component — no merge needed
      frames.push({
        activeNodes:  [source, target],
        visitedNodes: [],
        activeEdges:  [edgeId],
        pathEdges:    [],
        log:      `Edge ${source}——${target} (w = ${weight}): already in the same component — skip.`,
        category:     'explore',
        metadata:     { ...uf.snapshot(), examiningWeight: weight },
      });
      continue;
    }

    // Union the two components
    uf.union(source, target);

    frames.push({
      activeNodes:  [source, target],
      visitedNodes: [],
      activeEdges:  [edgeId],
      pathEdges:    [],
      log:      `Union ${source} (comp ${rootSrc}) ↔ ${target} (comp ${rootTgt}) via w = ${weight}.`,
      category:     'union',
      metadata:     { ...uf.snapshot(), lastUnionWeight: weight },
    });

    // Check if start and end are now connected
    if (uf.connected(startId, endId)) {
      frames.push({
        activeNodes:  [startId, endId],
        visitedNodes: [],
        activeEdges:  [edgeId],
        pathEdges:    [edgeId],
        log:      `${startId} and ${endId} are now in the same component! Threshold = ${weight}.`,
        category:     'found',
        metadata:     { threshold: weight },
      });

      return { frames, answer: weight };
    }
  }

  // Check final state 
  if (uf.connected(startId, endId)) {
    // Connected after last edge (edge case: they were already connected at start)
    const answer = sortedEdges.length > 0 ? sortedEdges[sortedEdges.length - 1].weight : 0;
    frames.push({
      activeNodes:  [startId, endId],
      visitedNodes: [],
      activeEdges:  [],
      pathEdges:    [],
      log:      `${startId} and ${endId} connected. Threshold = ${answer}.`,
      category:     'done',
      metadata:     { threshold: answer },
    });
    return { frames, answer };
  }

  frames.push({
    activeNodes:  [],
    visitedNodes: [],
    activeEdges:  [],
    pathEdges:    [],
    log:      `Exhausted all edges — no path between ${startId} and ${endId}.`,
    category:     'done',
  });

  return { frames, answer: 'No path' };
}

// Union-Find (Disjoint Set) with Union-By-Size + Path Compression
//   - Each node starts as its own set.
//   - union() merges smaller set into larger (union-by-size).
//   - find() uses path compression for near-O(1) amortised lookup.

class UnionFind {
  private parent: Map<string, string>;
  private size:   Map<string, number>;

  constructor(ids: string[]) {
    this.parent = new Map(ids.map((id) => [id, id]));
    this.size   = new Map(ids.map((id) => [id, 1]));
  }

  /** Find root with path compression. */
  find(x: string): string {
    if (this.parent.get(x) !== x) {
      // Path compression: point directly to root
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  /** Union two sets by size. Returns false if already in the same set. */
  union(x: string, y: string): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;

    // Attach smaller tree under larger tree (union-by-size)
    const sx = this.size.get(rx)!;
    const sy = this.size.get(ry)!;

    if (sx >= sy) {
      this.parent.set(ry, rx);
      this.size.set(rx, sx + sy);
    } else {
      this.parent.set(rx, ry);
      this.size.set(ry, sx + sy);
    }

    return true;
  }

  /** Returns true if x and y share the same root. */
  connected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /** Snapshot for the metadata panel (root of each node). */
  snapshot(): Record<string, string | number> {
    const out: Record<string, string | number> = {};
    for (const [id] of this.parent) {
      out[`root[${id}]`] = this.find(id);
    }
    return out;
  }
}