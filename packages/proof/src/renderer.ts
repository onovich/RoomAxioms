import type { ProofGraph, ProofNode } from './types.js';

export function renderProofText(graph: ProofGraph): readonly string[] {
  return [...graph.nodes].sort(compareNodes).map(renderNode);
}

function renderNode(node: ProofNode): string {
  const parentText = node.parents.length === 0 ? '' : ` <- ${node.parents.join(', ')}`;
  return `[${node.kind.toUpperCase()}] ${node.id}: ${node.label}${parentText}`;
}

function compareNodes(a: ProofNode, b: ProofNode): number {
  return nodeKindRank(a.kind) - nodeKindRank(b.kind) || a.id.localeCompare(b.id);
}

function nodeKindRank(kind: ProofNode['kind']): number {
  switch (kind) {
    case 'fact':
      return 0;
    case 'rule':
      return 1;
    case 'derived':
      return 2;
  }
}
