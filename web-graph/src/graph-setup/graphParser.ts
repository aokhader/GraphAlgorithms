import type cytoscape from 'cytoscape';
import type { Graph, GraphEdge, GraphNode } from '../algorithms/types';


export function parseCSV(csvText: string): Graph {
  const nodeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  const lines = csvText.trim().split('\n');

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return; // skip blanks and comments

    const parts = trimmed.split(',');
    if (parts.length < 2) {
      console.warn(`[graphParser] Skipping malformed line ${i + 1}: "${trimmed}"`);
      return;
    }

    const source = parts[0].trim();
    const target = parts[1].trim();
    const weight = parts[2] ? parseFloat(parts[2].trim()) : 1;

    if (!source || !target) return;

    nodeSet.add(source);
    nodeSet.add(target);
    edges.push({ id: `e${i}`, source, target, weight });
  });

  const nodes: GraphNode[] = [...nodeSet].map((id) => ({ id }));
  return buildGraph(nodes, edges);
}

/**
 * Read the current state of a Cytoscape instance and return a Graph object.
 * Call this before running any algorithm so the algorithm always uses the
 * latest graph state (including any user edits).
 */
export function graphFromCytoscape(cy: cytoscape.Core): Graph {
  const nodes: GraphNode[] = cy.nodes().map((n) => ({ id: n.id() }));

  const edges: GraphEdge[] = cy.edges().map((e) => ({
    id: e.id(),
    source: e.source().id(),
    target: e.target().id(),
    weight: parseFloat(String(e.data('weight') ?? 1)),
  }));

  return buildGraph(nodes, edges);
}


/**
 * Convert a Graph into Cytoscape element definitions that can be passed to
 * cy.add() or used as the `elements` option at initialization.
 */
export function graphToCytoscapeElements(
  graph: Graph
): cytoscape.ElementDefinition[] {
  const nodeEls: cytoscape.ElementDefinition[] = graph.nodes.map((n) => ({
    group: 'nodes' as const,
    data: { id: n.id },
  }));

  const edgeEls: cytoscape.ElementDefinition[] = graph.edges.map((e) => ({
    group: 'edges' as const,
    data: {
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
    },
  }));

  return [...nodeEls, ...edgeEls];
}

export function buildGraph(nodes: GraphNode[], edges: GraphEdge[]): Graph {
  const adj = new Map<
    string,
    { neighbor: string; weight: number; edgeId: string }[]
  >();

  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    adj
      .get(edge.source)
      ?.push({ neighbor: edge.target, weight: edge.weight, edgeId: edge.id });
    adj
      .get(edge.target)
      ?.push({ neighbor: edge.source, weight: edge.weight, edgeId: edge.id });
  }

  return { nodes, edges, adj };
}

/**
 * Serialize a Cytoscape graph back to CSV format, matching the input format
 * expected by the original C++ project.
 */
export function cytoscapeToCSV(cy: cytoscape.Core): string {
  return cy
    .edges()
    .map((e) => `${e.source().id()},${e.target().id()},${e.data('weight') ?? 1}`)
    .join('\n');
}