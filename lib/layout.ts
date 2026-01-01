import dagre from 'dagre'
import type { GraphNode, GraphEdge } from './types'

/**
 * Calculate node positions using Dagre layout algorithm
 * Improved spacing to prevent node overlap
 */
export function calculateLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: 'TB' | 'LR' = 'LR'
): GraphNode[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  
  // Increased spacing for better visualization and to prevent overlap
  g.setGraph({ 
    rankdir: direction, 
    nodesep: 180,  // Horizontal spacing between nodes (increased from 100)
    ranksep: 250,  // Vertical spacing between ranks (increased from 150)
    marginx: 50,   // Margin on left/right
    marginy: 50,   // Margin on top/bottom
    edgesep: 50,   // Minimum edge separation
  })

  // Add nodes to graph with proper dimensions
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.type === 'startup' ? 200 : 160,
      height: node.type === 'startup' ? 120 : 90,
    })
  })

  // Add edges to graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(g)

  // Update node positions with proper centering
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    if (!nodeWithPosition) {
      // Fallback for isolated nodes
      return {
        ...node,
        position: { x: 0, y: 0 },
      }
    }
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.type === 'startup' ? 100 : 80),
        y: nodeWithPosition.y - (node.type === 'startup' ? 60 : 45),
      },
    }
  })
}

