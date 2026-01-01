/**
 * Graph utility functions
 */
import type {
  GraphNode,
  GraphEdge,
  GraphData,
  FilterCriteria,
  CompanyStage,
  NodeType,
} from './types'

/**
 * Build a graph structure from nodes and edges
 */
export function buildGraph(nodes: GraphNode[], edges: GraphEdge[]): GraphData {
  return { nodes, edges }
}

/**
 * Find a node by ID
 */
export function findNodeById(nodes: GraphNode[], nodeId: string): GraphNode | undefined {
  return nodes.find((node) => node.id === nodeId)
}

/**
 * Get all nodes directly connected to a given node
 */
export function getNeighbors(
  nodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  const connectedNodeIds = new Set<string>()

  // Find all edges connected to this node
  for (const edge of edges) {
    if (edge.source === nodeId) {
      connectedNodeIds.add(edge.target)
    } else if (edge.target === nodeId) {
      connectedNodeIds.add(edge.source)
    }
  }

  // Return the actual node objects
  return nodes.filter((node) => connectedNodeIds.has(node.id))
}

/**
 * Filter graph based on criteria
 */
export function filterGraph(data: GraphData, criteria: FilterCriteria): GraphData {
  let filteredNodes = [...data.nodes]
  let filteredEdges = [...data.edges]

  // Filter by domain tags (for startups)
  if (criteria.domainTags && criteria.domainTags.length > 0) {
    filteredNodes = filteredNodes.filter((node) => {
      if (node.type === 'startup') {
        const startup = node.data as { domainTags: string[] }
        return criteria.domainTags!.some((tag) => startup.domainTags.includes(tag))
      }
      return false
    })
  }

  // Filter by company stage (for startups)
  if (criteria.stages && criteria.stages.length > 0) {
    filteredNodes = filteredNodes.filter((node) => {
      if (node.type === 'startup') {
        const startup = node.data as { stage: CompanyStage }
        return criteria.stages!.includes(startup.stage)
      }
      return false
    })
  }

  // Filter by search term (partial string matching on name)
  if (criteria.searchTerm && criteria.searchTerm.trim().length > 0) {
    const searchLower = criteria.searchTerm.toLowerCase().trim()
    filteredNodes = filteredNodes.filter((node) => {
      const name = node.type === 'startup' ? node.data.name : node.data.name
      return name.toLowerCase().includes(searchLower)
    })
  }

  // Filter edges to only include those between remaining nodes
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))
  filteredEdges = filteredEdges.filter(
    (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
  )

  // Include connected person nodes if filtering startups (and vice versa)
  // This ensures relationships are visible
  if (criteria.domainTags || criteria.stages) {
    const connectedPersonIds = new Set<string>()
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))

    // Check all original edges to find connected nodes
    for (const edge of data.edges) {
      const sourceInFiltered = filteredNodeIds.has(edge.source)
      const targetInFiltered = filteredNodeIds.has(edge.target)

      // If one end is in filtered set, include the other end if it's a person
      if (sourceInFiltered) {
        const targetNode = findNodeById(data.nodes, edge.target)
        if (targetNode && targetNode.type === 'person') {
          connectedPersonIds.add(targetNode.id)
        }
      }
      if (targetInFiltered) {
        const sourceNode = findNodeById(data.nodes, edge.source)
        if (sourceNode && sourceNode.type === 'person') {
          connectedPersonIds.add(sourceNode.id)
        }
      }
    }

    // Add connected person nodes
    for (const nodeId of connectedPersonIds) {
      const node = findNodeById(data.nodes, nodeId)
      if (node && !filteredNodes.find((n) => n.id === node.id)) {
        filteredNodes.push(node)
      }
    }

    // Re-filter edges to include new connections
    const finalNodeIds = new Set(filteredNodes.map((n) => n.id))
    filteredEdges = data.edges.filter(
      (edge) => finalNodeIds.has(edge.source) && finalNodeIds.has(edge.target)
    )
  }

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  }
}

/**
 * Get node type from node
 */
export function getNodeType(node: GraphNode): NodeType {
  return node.type
}

/**
 * Check if a node is a startup
 */
export function isStartup(node: GraphNode): boolean {
  return node.type === 'startup'
}

/**
 * Check if a node is a person
 */
export function isPerson(node: GraphNode): boolean {
  return node.type === 'person'
}

