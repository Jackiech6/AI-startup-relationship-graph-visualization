/**
 * Integration tests that test actual data loading and parsing
 */
import { loadSeedData, validateData, parseGraphData, loadAndParseGraphData } from '@/lib/data'
import { buildGraph, findNodeById, getNeighbors, filterGraph } from '@/lib/graph-utils'

describe('Integration Tests', () => {
  describe('Real Data Loading and Parsing', () => {
    it('should load and parse real seed data', async () => {
      const graphData = await loadAndParseGraphData()
      expect(graphData.nodes.length).toBeGreaterThan(0)
      expect(graphData.edges.length).toBeGreaterThan(0)
    })

    it('should have valid node relationships', async () => {
      const graphData = await loadAndParseGraphData()
      
      // All edges should reference valid nodes
      const nodeIds = new Set(graphData.nodes.map((n) => n.id))
      for (const edge of graphData.edges) {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      }
    })

    it('should have startups and people in the graph', async () => {
      const graphData = await loadAndParseGraphData()
      const startups = graphData.nodes.filter((n) => n.type === 'startup')
      const people = graphData.nodes.filter((n) => n.type === 'person')
      
      expect(startups.length).toBeGreaterThan(0)
      expect(people.length).toBeGreaterThan(0)
    })
  })

  describe('Graph Utilities with Real Data', () => {
    let graphData: Awaited<ReturnType<typeof loadAndParseGraphData>>

    beforeEach(async () => {
      graphData = await loadAndParseGraphData()
    })

    it('should find nodes by ID', () => {
      const firstNode = graphData.nodes[0]
      const found = findNodeById(graphData.nodes, firstNode.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(firstNode.id)
    })

    it('should get neighbors for a node', () => {
      if (graphData.nodes.length > 0 && graphData.edges.length > 0) {
        const nodeWithEdges = graphData.nodes.find((node) => {
          return graphData.edges.some((edge) => edge.source === node.id || edge.target === node.id)
        })

        if (nodeWithEdges) {
          const neighbors = getNeighbors(nodeWithEdges.id, graphData.nodes, graphData.edges)
          expect(neighbors.length).toBeGreaterThan(0)
        }
      }
    })

    it('should filter graph by domain tags', () => {
      // Get a domain tag from an actual startup
      const startup = graphData.nodes.find((n) => n.type === 'startup')
      if (startup && startup.type === 'startup') {
        const domainTag = startup.data.domainTags[0]
        if (domainTag) {
          const filtered = filterGraph(graphData, { domainTags: [domainTag] })
          expect(filtered.nodes.length).toBeGreaterThan(0)
          expect(filtered.nodes.length).toBeLessThanOrEqual(graphData.nodes.length)
        }
      }
    })

    it('should filter graph by search term', () => {
      if (graphData.nodes.length > 0) {
        const firstNodeName = graphData.nodes[0].data.name
        const searchTerm = firstNodeName.substring(0, Math.min(5, firstNodeName.length))
        const filtered = filterGraph(graphData, { searchTerm })
        expect(filtered.nodes.length).toBeGreaterThan(0)
      }
    })
  })
})

