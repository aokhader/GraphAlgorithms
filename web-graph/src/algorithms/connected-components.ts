import type { Graph, AlgorithmResult, StepFrame } from './types';

export function connectedComponents(graph: Graph): AlgorithmResult {
  const frames: StepFrame[] = [];
  const visited    = new Set<string>();
  const compOf     = new Map<string, number>(); // nodeId → component index (1-based)
  let   numComponents = 0;

  frames.push({
    activeNodes:  [],
    visitedNodes: [],
    activeEdges:  [],
    pathEdges:    [],
    log:      `Finding connected components. Will DFS from each unvisited node.`,
    category:     'init',
  });

  // Start a new component from each unvisited node
  for (const { id: seed } of graph.nodes) {
    if (visited.has(seed)) continue;

    numComponents++;
    const compIndex  = numComponents;
    const compNodes: string[] = [];

    const stack: string[] = [seed];
    while (stack.length > 0) {
      const u = stack.pop()!;
      if (visited.has(u)) continue;

      visited.add(u);
      compOf.set(u, compIndex);
      compNodes.push(u);

      frames.push({
        activeNodes:  [u],
        visitedNodes: [...visited],
        activeEdges:  [],
        pathEdges:    [],
        log:      `Component ${compIndex}: visit ${u}.`,
        category:     'visit',
        metadata:     compSnapshot(compOf),
      });

      // Neighbors
      for (const { neighbor, edgeId } of graph.adj.get(u)!) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);

          frames.push({
            activeNodes:  [u, neighbor],
            visitedNodes: [...visited],
            activeEdges:  [edgeId],
            pathEdges:    [],
            log:      `Component ${compIndex}: ${neighbor} is unvisited — push onto stack.`,
            category:     'explore',
            metadata:     compSnapshot(compOf),
          });
        }
      }
    }

    // Completed component
    frames.push({
      activeNodes:  compNodes,
      visitedNodes: [...visited],
      activeEdges:  [],
      pathEdges:    [],
      log:      `Component ${compIndex} complete: { ${compNodes.join(', ')} }`,
      category:     'found',
      metadata:     compSnapshot(compOf),
    });
  }

  // Find min cross-component edge weight
  const crossEdges = graph.edges.filter(
    (e) => compOf.get(e.source) !== compOf.get(e.target),
  );
  const minCrossWeight =
    crossEdges.length > 0
      ? Math.min(...crossEdges.map((e) => e.weight))
      : null;

  const doneMsg =
    numComponents === 1
      ? `Graph is fully connected — 1 component.`
      : `Found ${numComponents} components.`
        + (minCrossWeight !== null
          ? ` Minimum cross-component edge weight: ${minCrossWeight}.`
          : '');

  frames.push({
    activeNodes:  [],
    visitedNodes: [...visited],
    activeEdges:  [],
    pathEdges:    [],
    log:      doneMsg,
    category:     'done',
    metadata:     {
      ...compSnapshot(compOf),
      ...(minCrossWeight !== null ? { minCrossEdge: minCrossWeight } : {}),
    },
  });

  return {
    frames,
    answer: numComponents,
  };
}

// Metadata helpers
function compSnapshot(compOf: Map<string, number>): Record<string, number> {
  return Object.fromEntries(
    [...compOf.entries()].map(([id, comp]) => [`comp[${id}]`, comp]),
  );
}
