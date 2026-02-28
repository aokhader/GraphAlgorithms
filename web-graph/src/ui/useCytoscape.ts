'use client';

import { useRef, useCallback, useEffect } from 'react';
import cytoscape from 'cytoscape';
import type { Core, ElementDefinition, LayoutOptions, CoseLayoutOptions } from 'cytoscape';
import type { StepFrame } from '../algorithms/types';

const STYLESHEET: any[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#0f1117',
      'border-color': '#2a2d3e',
      'border-width': 2,
      'label': 'data(id)',
      'color': '#c8cde0',
      'font-family': '"JetBrains Mono", "Fira Code", monospace',
      'font-size': 13,
      'font-weight': 600,
      'text-valign': 'center',
      'text-halign': 'center',
      'width': 44,
      'height': 44,
      'transition-property': 'background-color, border-color, border-width',
      'transition-duration': '180ms',
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5,
      'line-color': '#1e2130',
      'curve-style': 'bezier',
      'label': 'data(weight)',
      'font-size': 10,
      'font-family': '"JetBrains Mono", "Fira Code", monospace',
      'color': '#3a3f55',
      'text-background-color': '#080a10',
      'text-background-opacity': 1,
      'text-background-padding': '3px',
      'transition-property': 'line-color, width',
      'transition-duration': '180ms',
    },
  },
  {
    selector: 'node.active',
    style: {
      'background-color': '#1a3a6e',
      'border-color': '#4a7cf5',
      'border-width': 3,
    },
  },
  {
    selector: 'node.visited',
    style: {
      'background-color': '#0d2e1e',
      'border-color': '#2ea86a',
      'border-width': 2,
    },
  },
  {
    selector: 'node.path',
    style: {
      'background-color': '#3d2800',
      'border-color': '#e8960a',
      'border-width': 3,
    },
  },
  {
    selector: 'edge.active',
    style: { 'line-color': '#4a7cf5', 'width': 3 },
  },
  {
    selector: 'edge.path',
    style: { 'line-color': '#e8960a', 'width': 3.5 },
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#e05c7a',
      'border-width': 3,
    },
  },
];

const LAYOUT_OPTIONS: Record<string, LayoutOptions> = {
  cose: {
    name: 'cose',
    padding: 60,
    animate: false,
    nodeRepulsion: () => 8000,
    idealEdgeLength: () => 100,
  } as CoseLayoutOptions,
  circle:       { name: 'circle',       padding: 60 },
  grid:         { name: 'grid',         padding: 40 },
  breadthfirst: { name: 'breadthfirst', padding: 60 },
};

export interface CytoscapeControls {
  containerRef: React.RefObject<HTMLDivElement | null>;
  applyFrame:   (frame: StepFrame, index: number) => void;
  resetStyles:  () => void;
  loadGraph:    (elements: ElementDefinition[], layoutName?: string) => void;
  getCy:        () => Core | null;
}

export function useCytoscape(): CytoscapeControls {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef        = useRef<Core | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || cyRef.current) return;

    // Log container dimensions — if these are 0x0, that's the root cause
    console.log('[cy] container size:', container.offsetWidth, 'x', container.offsetHeight);

    cyRef.current = cytoscape({
      container,
      style: STYLESHEET,
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: true,
    });

    console.log('[cy] instance created:', cyRef.current);

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, []);

  const resetStyles = useCallback(() => {
    cyRef.current?.elements().removeClass('active visited path');
  }, []);

  const applyFrame = useCallback((frame: StepFrame, index: number) => {
    const cy = cyRef.current;
    if (!cy) return;

    if (index === -1) {
      cy.elements().removeClass('active visited path');
      return;
    }

    cy.elements().removeClass('active visited path');

    frame.visitedNodes.forEach((id) => cy.$(`#${id}`).addClass('visited'));
    frame.activeEdges.forEach((id)  => cy.$(`#${id}`).addClass('active'));
    frame.pathEdges.forEach((id)    => cy.$(`#${id}`).addClass('path'));
    frame.activeNodes.forEach((id)  =>
      cy.$(`#${id}`).removeClass('visited').addClass('active')
    );

    frame.pathEdges.forEach((edgeId) => {
      const edge = cy.$(`#${edgeId}`);
      if (edge.length) {
        edge.source().addClass('path');
        edge.target().addClass('path');
      }
    });
  }, []);

  const loadGraph = useCallback((elements: ElementDefinition[], layoutName = 'cose') => {
    const cy = cyRef.current;
    if (!cy) {
      console.error('[cy] loadGraph called but cy is null');
      return;
    }

    console.log('[cy] container size at loadGraph:', containerRef.current?.offsetWidth, 'x', containerRef.current?.offsetHeight);
    console.log('[cy] adding', elements.length, 'elements with layout:', layoutName);

    cy.elements().remove();
    cy.add(elements);

    console.log('[cy] after add, node count:', cy.nodes().length);

    const options = LAYOUT_OPTIONS[layoutName] ?? LAYOUT_OPTIONS.cose;
    const layout = cy.layout(options);
    layout.run();

    console.log('[cy] layout run complete');
    console.log('[cy] first node position:', cy.nodes().first().position());

    cy.fit(undefined, 60);
    console.log('[cy] fit complete, zoom:', cy.zoom(), 'pan:', cy.pan());
  }, []);

  const getCy = useCallback(() => cyRef.current, []);

  return { containerRef, applyFrame, resetStyles, loadGraph, getCy };
}