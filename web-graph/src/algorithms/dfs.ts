import type { Graph, AlgorithmResult, StepFrame } from './types';
import { reconstructPath } from './bfs';

export function dfs(graph: Graph, startId: string, endId: string): AlgorithmResult {
  const frames: StepFrame[] = [];

  if (!graph.adj.has(startId) || !graph.adj.has(endId)) {
    return {
      frames: [{
        activeNodes: [], visitedNodes: [], activeEdges: [], pathEdges: [],
        log: `Error: node "${!graph.adj.has(startId) ? startId : endId}" not found in graph.`,
        category: 'done', queue: [],
      }],
      answer: 'Invalid node',
    };
  }

  const visited  = new Set<string>([startId]);
  const prev     = new Map<string, string | null>([[startId, null]]);
  const prevEdge = new Map<string, string | null>([[startId, null]]);
  const stack: string[] = [startId];

  frames.push({
    activeNodes: [startId], visitedNodes: [startId], activeEdges: [], pathEdges: [],
    log: `Start DFS from ${startId}. Mark visited, push to stack.`,
    category: 'init',
    queue: [...stack].reverse(), // show top of stack first
  });

  let found = false;
  while (stack.length > 0) {
    const u = stack.pop()!;

    frames.push({
      activeNodes: [u], visitedNodes: [...visited], activeEdges: [], pathEdges: [],
      log: `Pop ${u} — exploring ${graph.adj.get(u)!.length} neighbor(s).`,
      category: 'visit',
      queue: [...stack].reverse(),
    });

    if (u === endId) { found = true; break; }

    for (const { neighbor, edgeId } of graph.adj.get(u)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        prev.set(neighbor, u);
        prevEdge.set(neighbor, edgeId);
        stack.push(neighbor);

        frames.push({
          activeNodes: [u, neighbor], visitedNodes: [...visited],
          activeEdges: [edgeId], pathEdges: [],
          log: `Discover ${neighbor} via ${u} — push to stack.`,
          category: 'explore',
          queue: [...stack].reverse(),
        });
      } else {
        frames.push({
          activeNodes: [u, neighbor], visitedNodes: [...visited],
          activeEdges: [edgeId], pathEdges: [],
          log: `${neighbor} already visited — skip.`,
          category: 'explore',
          queue: [...stack].reverse(),
        });
      }
    }
  }

  const { path, pathEdgeIds } = reconstructPath(endId, startId, prev, prevEdge);
  const pathFound = found || path[0] === startId;

  frames.push({
    activeNodes: pathFound ? path : [], visitedNodes: [...visited],
    activeEdges: [], pathEdges: pathFound ? pathEdgeIds : [],
    log: pathFound
      ? `Path found (${path.length - 1} hop${path.length !== 2 ? 's' : ''}): ${path.join(' → ')}`
      : `No path exists from ${startId} to ${endId}.`,
    category: 'done',
    queue: [],
  });

  return {
    frames,
    path:   pathFound ? path : undefined,
    answer: pathFound ? path.length - 1 : 'No path',
  };
}