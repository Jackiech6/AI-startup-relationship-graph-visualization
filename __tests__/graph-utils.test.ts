/**
 * Tests for graph utility functions
 */
import {
  buildGraph,
  findNodeById,
  getNeighbors,
  filterGraph,
  getNodeType,
  isStartup,
  isPerson,
} from '@/lib/graph-utils'
import type { GraphNode, GraphEdge, GraphData, FilterCriteria } from '@/lib/types'

// Test data helpers
function createStartupNode(id: string, name: string, domainTags: string[] = [], stage = 'seed'): GraphNode {
  return {
    id,
    type: 'startup',
    data: {
      id,
      name,
      domainTags,
      stage: stage as any,
      foundedYear: 2020,
      location: 'SF',
      description: 'Test',
    },
  }
}

function createPersonNode(id: string, name: string): GraphNode {
  return {
    id,
    type: 'person',
    data: {
      id,
      name,
      roles: [],
      keywords: [],
      bio: 'Test',
    },
  }
}

function createEdge(id: string, source: string, target: string): GraphEdge {
  return {
    id,
    source,
    target,
    type: 'co-founded',
  }
}

describe('Graph Utilities', () => {
  describe('buildGraph', () => {
    it('should build graph from nodes and edges', () => {
      const nodes: GraphNode[] = [createStartupNode('s1', 'Startup 1')]
      const edges: GraphEdge[] = []
      const graph = buildGraph(nodes, edges)
      expect(graph.nodes).toEqual(nodes)
      expect(graph.edges).toEqual(edges)
    })
  })

  describe('findNodeById', () => {
    const nodes: GraphNode[] = [
      createStartupNode('s1', 'Startup 1'),
      createPersonNode('p1', 'Person 1'),
      createStartupNode('s2', 'Startup 2'),
    ]

    it('should find node by ID', () => {
      const node = findNodeById(nodes, 's1')
      expect(node).toBeDefined()
      expect(node?.id).toBe('s1')
      expect(node?.data.name).toBe('Startup 1')
    })

    it('should return undefined for non-existent ID', () => {
      const node = findNodeById(nodes, 'nonexistent')
      expect(node).toBeUndefined()
    })

    it('should find person nodes', () => {
      const node = findNodeById(nodes, 'p1')
      expect(node).toBeDefined()
      expect(node?.id).toBe('p1')
      expect(node?.type).toBe('person')
    })
  })

  describe('getNeighbors', () => {
    const nodes: GraphNode[] = [
      createStartupNode('s1', 'Startup 1'),
      createPersonNode('p1', 'Person 1'),
      createPersonNode('p2', 'Person 2'),
      createStartupNode('s2', 'Startup 2'),
    ]

    const edges: GraphEdge[] = [
      createEdge('e1', 'p1', 's1'),
      createEdge('e2', 'p2', 's1'),
      createEdge('e3', 'p1', 's2'),
    ]

    it('should get neighbors for a node', () => {
      const neighbors = getNeighbors('s1', nodes, edges)
      expect(neighbors).toHaveLength(2)
      expect(neighbors.map((n) => n.id).sort()).toEqual(['p1', 'p2'])
    })

    it('should get neighbors in both directions', () => {
      const neighbors = getNeighbors('p1', nodes, edges)
      expect(neighbors).toHaveLength(2)
      expect(neighbors.map((n) => n.id).sort()).toEqual(['s1', 's2'])
    })

    it('should return empty array for node with no neighbors', () => {
      const isolatedNode = createPersonNode('p3', 'Person 3')
      const allNodes = [...nodes, isolatedNode]
      const neighbors = getNeighbors('p3', allNodes, edges)
      expect(neighbors).toHaveLength(0)
    })

    it('should handle node not in graph', () => {
      const neighbors = getNeighbors('nonexistent', nodes, edges)
      expect(neighbors).toHaveLength(0)
    })
  })

  describe('filterGraph', () => {
    const nodes: GraphNode[] = [
      createStartupNode('s1', 'Startup 1', ['AI', 'ML'], 'seed'),
      createStartupNode('s2', 'Startup 2', ['Healthcare'], 'series-a'),
      createStartupNode('s3', 'Startup 3', ['AI'], 'seed'),
      createPersonNode('p1', 'Person 1'),
      createPersonNode('p2', 'Person 2'),
    ]

    const edges: GraphEdge[] = [
      createEdge('e1', 'p1', 's1'),
      createEdge('e2', 'p2', 's2'),
      createEdge('e3', 'p1', 's3'),
    ]

    const graph: GraphData = { nodes, edges }

    it('should filter by domain tags', () => {
      const criteria: FilterCriteria = { domainTags: ['AI'] }
      const filtered = filterGraph(graph, criteria)
      const startupIds = filtered.nodes.filter((n) => n.type === 'startup').map((n) => n.id)
      expect(startupIds.sort()).toEqual(['s1', 's3'])
      // Should include connected person nodes
      expect(filtered.nodes.find((n) => n.id === 'p1')).toBeDefined()
    })

    it('should filter by company stage', () => {
      const criteria: FilterCriteria = { stages: ['seed'] }
      const filtered = filterGraph(graph, criteria)
      const startupIds = filtered.nodes.filter((n) => n.type === 'startup').map((n) => n.id)
      expect(startupIds.sort()).toEqual(['s1', 's3'])
    })

    it('should filter by search term', () => {
      const criteria: FilterCriteria = { searchTerm: 'Startup 1' }
      const filtered = filterGraph(graph, criteria)
      expect(filtered.nodes.find((n) => n.id === 's1')).toBeDefined()
      expect(filtered.nodes.find((n) => n.id === 's2')).toBeUndefined()
    })

    it('should filter by search term case-insensitively', () => {
      const criteria: FilterCriteria = { searchTerm: 'startup 1' }
      const filtered = filterGraph(graph, criteria)
      expect(filtered.nodes.find((n) => n.id === 's1')).toBeDefined()
    })

    it('should filter by multiple domain tags (OR logic)', () => {
      const criteria: FilterCriteria = { domainTags: ['AI', 'Healthcare'] }
      const filtered = filterGraph(graph, criteria)
      const startupIds = filtered.nodes.filter((n) => n.type === 'startup').map((n) => n.id)
      expect(startupIds.sort()).toEqual(['s1', 's2', 's3'])
    })

    it('should filter by multiple criteria', () => {
      const criteria: FilterCriteria = { domainTags: ['AI'], stages: ['seed'] }
      const filtered = filterGraph(graph, criteria)
      const startupIds = filtered.nodes.filter((n) => n.type === 'startup').map((n) => n.id)
      expect(startupIds.sort()).toEqual(['s1', 's3'])
    })

    it('should filter edges to only include connections between filtered nodes', () => {
      const criteria: FilterCriteria = { domainTags: ['AI'] }
      const filtered = filterGraph(graph, criteria)
      // Should only have edges between s1, s3, and p1
      for (const edge of filtered.edges) {
        const sourceInFiltered = filtered.nodes.some((n) => n.id === edge.source)
        const targetInFiltered = filtered.nodes.some((n) => n.id === edge.target)
        expect(sourceInFiltered).toBe(true)
        expect(targetInFiltered).toBe(true)
      }
    })

    it('should return empty graph for no matches', () => {
      const criteria: FilterCriteria = { domainTags: ['NonExistent'] }
      const filtered = filterGraph(graph, criteria)
      expect(filtered.nodes.filter((n) => n.type === 'startup')).toHaveLength(0)
    })

    it('should handle empty criteria', () => {
      const criteria: FilterCriteria = {}
      const filtered = filterGraph(graph, criteria)
      expect(filtered.nodes.length).toBe(graph.nodes.length)
      expect(filtered.edges.length).toBe(graph.edges.length)
    })

    it('should handle empty search term', () => {
      const criteria: FilterCriteria = { searchTerm: '   ' }
      const filtered = filterGraph(graph, criteria)
      expect(filtered.nodes.length).toBe(graph.nodes.length)
    })
  })

  describe('getNodeType', () => {
    it('should return node type', () => {
      const startupNode = createStartupNode('s1', 'Startup 1')
      const personNode = createPersonNode('p1', 'Person 1')
      expect(getNodeType(startupNode)).toBe('startup')
      expect(getNodeType(personNode)).toBe('person')
    })
  })

  describe('isStartup', () => {
    it('should return true for startup nodes', () => {
      const startupNode = createStartupNode('s1', 'Startup 1')
      expect(isStartup(startupNode)).toBe(true)
    })

    it('should return false for person nodes', () => {
      const personNode = createPersonNode('p1', 'Person 1')
      expect(isStartup(personNode)).toBe(false)
    })
  })

  describe('isPerson', () => {
    it('should return true for person nodes', () => {
      const personNode = createPersonNode('p1', 'Person 1')
      expect(isPerson(personNode)).toBe(true)
    })

    it('should return false for startup nodes', () => {
      const startupNode = createStartupNode('s1', 'Startup 1')
      expect(isPerson(startupNode)).toBe(false)
    })
  })
})

