import type { Graph, AlgorithmResult, StepFrame } from './types';

export function bfs(graph: Graph, startId: string, endId: string): AlgorithmResult {
  const frames: StepFrame[] = [];

  // Malformed input
  if (!graph.adj.has(startId) || !graph.adj.has(endId)) {
    return {
      frames: [{
        activeNodes: [], visitedNodes: [], activeEdges: [], pathEdges: [],
        log: `Error: node "${!graph.adj.has(startId) ? startId : endId}" not found in graph.`,
        category: 'done',
      }],
      answer: 'Invalid node',
    };
  }

  const visited  = new Set<string>([startId]);
  const prev     = new Map<string, string | null>([[startId, null]]);
  const prevEdge = new Map<string, string | null>([[startId, null]]);
  const queue: string[] = [startId];

  frames.push({
    activeNodes:  [startId],
    visitedNodes: [startId],
    activeEdges:  [],
    pathEdges:    [],
    log:      `Start BFS from ${startId}. Mark visited, enqueue.`,
    category:     'init',
  });

  // BFS loop
  let found = false;
  while (queue.length > 0) {
    const u = queue.shift()!;

    frames.push({
      activeNodes:  [u],
      visitedNodes: [...visited],
      activeEdges:  [],
      pathEdges:    [],
      log:      `Dequeue ${u} — exploring ${graph.adj.get(u)!.length} neighbor(s).`,
      category:     'visit',
    });

    if (u === endId) {
      found = true;
      break;
    }

    for (const { neighbor, edgeId } of graph.adj.get(u)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        prev.set(neighbor, u);
        prevEdge.set(neighbor, edgeId);
        queue.push(neighbor);

        frames.push({
          activeNodes:  [u, neighbor],
          visitedNodes: [...visited],
          activeEdges:  [edgeId],
          pathEdges:    [],
          log:      `Discover ${neighbor} via ${u} — enqueue.`,
          category:     'explore',
        });
      } else {
        frames.push({
          activeNodes:  [u, neighbor],
          visitedNodes: [...visited],
          activeEdges:  [edgeId],
          pathEdges:    [],
          log:      `${neighbor} already visited — skip.`,
          category:     'explore',
        });
      }
    }
  }

  const { path, pathEdgeIds } = reconstructPath(endId, startId, prev, prevEdge);
  const pathFound = found || path[0] === startId;

  frames.push({
    activeNodes:  pathFound ? path : [],
    visitedNodes: [...visited],
    activeEdges:  [],
    pathEdges:    pathFound ? pathEdgeIds : [],
    log:      pathFound
      ? `Shortest path (${path.length - 1} hop${path.length !== 2 ? 's' : ''}): ${path.join(' → ')}`
      : `No path exists from ${startId} to ${endId}.`,
    category: 'done',
  });

  return {
    frames,
    path:   pathFound ? path : undefined,
    answer: pathFound ? path.length - 1 : 'No path',
  };
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