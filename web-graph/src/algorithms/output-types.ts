export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface GraphNode {
  id: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  // nodeId: [{neighbor, weight, edgeId}] 
  adj: Map<string, { neighbor: string; weight: number; edgeId: string }[]>;
}

export type StepCategory =
  | 'init'
  | 'visit'
  | 'explore'
  | 'relax'
  | 'found'
  | 'done'
  | 'union';

export interface StepFrame {
  /** Nodes being processed right now */
  activeNodes: string[];
  visitedNodes: string[];
  /** Edges currently being traversed */
  activeEdges: string[];
  /** Edges on the final answer path */
  pathEdges: string[];
  message: string;
  category: StepCategory;
  /** Optional key-value data (e.g. distance table) */
  metadata?: Record<string, string | number>;
}

export interface AlgorithmResult {
  frames: StepFrame[];
  path?: string[];
  answer?: number | string;
}