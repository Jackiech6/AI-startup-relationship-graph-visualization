/**
 * Tests for data loading and parsing
 */
import {
  loadSeedData,
  validateData,
  parseGraphData,
  loadAndParseGraphData,
} from '@/lib/data'
import type { SeedData, GraphData, Startup, Person, Edge } from '@/lib/types'

describe('Data Loading', () => {
  describe('loadSeedData', () => {
    it('should load seed data from JSON file', () => {
      const data = loadSeedData()
      expect(data).toBeDefined()
      expect(data.startups).toBeInstanceOf(Array)
      expect(data.people).toBeInstanceOf(Array)
      expect(data.edges).toBeInstanceOf(Array)
    })

    it('should load correct number of entities', () => {
      const data = loadSeedData()
      expect(data.startups.length).toBeGreaterThanOrEqual(20)
      expect(data.startups.length).toBeLessThanOrEqual(30)
      expect(data.people.length).toBeGreaterThanOrEqual(30)
      expect(data.people.length).toBeLessThanOrEqual(50)
      expect(data.edges.length).toBeGreaterThan(0)
    })

    it('should have valid startup structure', () => {
      const data = loadSeedData()
      const startup = data.startups[0]
      expect(startup).toHaveProperty('id')
      expect(startup).toHaveProperty('name')
      expect(startup).toHaveProperty('domainTags')
      expect(startup).toHaveProperty('stage')
      expect(startup).toHaveProperty('foundedYear')
      expect(startup).toHaveProperty('location')
      expect(startup).toHaveProperty('description')
    })

    it('should have valid person structure', () => {
      const data = loadSeedData()
      const person = data.people[0]
      expect(person).toHaveProperty('id')
      expect(person).toHaveProperty('name')
      expect(person).toHaveProperty('roles')
      expect(person).toHaveProperty('keywords')
      expect(person).toHaveProperty('bio')
    })

    it('should have valid edge structure', () => {
      const data = loadSeedData()
      const edge = data.edges[0]
      expect(edge).toHaveProperty('sourceId')
      expect(edge).toHaveProperty('targetId')
      expect(edge).toHaveProperty('type')
    })
  })

  describe('validateData', () => {
    it('should validate correct seed data', () => {
      const validData: SeedData = {
        startups: [
          {
            id: 'test-startup',
            name: 'Test Startup',
            domainTags: ['AI'],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [
          {
            id: 'test-person',
            name: 'Test Person',
            roles: ['Founder'],
            keywords: ['AI'],
            bio: 'Test bio',
          },
        ],
        edges: [
          {
            sourceId: 'test-person',
            targetId: 'test-startup',
            type: 'co-founded',
            sinceYear: 2020,
          },
        ],
      }

      const validated = validateData(validData)
      expect(validated).toEqual(validData)
    })

    it('should reject invalid startup data', () => {
      const invalidData = {
        startups: [
          {
            id: 'test',
            name: 'Test',
            // Missing required fields
          },
        ],
        people: [],
        edges: [],
      }

      expect(() => validateData(invalidData)).toThrow('Data validation failed')
    })

    it('should reject invalid person data', () => {
      const invalidData = {
        startups: [],
        people: [
          {
            id: 'test',
            // Missing required fields
          },
        ],
        edges: [],
      }

      expect(() => validateData(invalidData)).toThrow('Data validation failed')
    })

    it('should reject invalid edge data', () => {
      const invalidData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [
          {
            sourceId: 'invalid',
            targetId: 'invalid',
            type: 'invalid-type', // Invalid edge type
          },
        ],
      }

      expect(() => validateData(invalidData)).toThrow('Data validation failed')
    })

    it('should reject invalid company stage', () => {
      const invalidData = {
        startups: [
          {
            id: 'test',
            name: 'Test',
            domainTags: [],
            stage: 'invalid-stage',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [],
      }

      expect(() => validateData(invalidData)).toThrow('Data validation failed')
    })

    it('should reject invalid founded year', () => {
      const invalidData = {
        startups: [
          {
            id: 'test',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 1800, // Too old
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [],
      }

      expect(() => validateData(invalidData)).toThrow('Data validation failed')
    })
  })

  describe('parseGraphData', () => {
    it('should parse seed data to graph format', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test Startup',
            domainTags: ['AI'],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [
          {
            id: 'person-1',
            name: 'Test Person',
            roles: ['Founder'],
            keywords: ['AI'],
            bio: 'Test bio',
          },
        ],
        edges: [
          {
            sourceId: 'person-1',
            targetId: 'startup-1',
            type: 'co-founded',
            sinceYear: 2020,
          },
        ],
      }

      const graphData = parseGraphData(seedData)
      expect(graphData.nodes).toHaveLength(2)
      expect(graphData.edges).toHaveLength(1)
    })

    it('should create correct node structure', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test Startup',
            domainTags: ['AI'],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [],
      }

      const graphData = parseGraphData(seedData)
      const node = graphData.nodes[0]
      expect(node.id).toBe('startup-1')
      expect(node.type).toBe('startup')
      expect(node.data.name).toBe('Test Startup')
    })

    it('should create correct edge structure', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [
          {
            id: 'person-1',
            name: 'Test',
            roles: [],
            keywords: [],
            bio: 'Test',
          },
        ],
        edges: [
          {
            sourceId: 'person-1',
            targetId: 'startup-1',
            type: 'co-founded',
            sinceYear: 2020,
          },
        ],
      }

      const graphData = parseGraphData(seedData)
      const edge = graphData.edges[0]
      expect(edge.source).toBe('person-1')
      expect(edge.target).toBe('startup-1')
      expect(edge.type).toBe('co-founded')
      expect(edge.label).toBe('Co-founded')
      expect(edge.data?.sinceYear).toBe(2020)
    })

    it('should throw error on duplicate node IDs', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'duplicate-id',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [
          {
            id: 'duplicate-id', // Duplicate ID
            name: 'Test',
            roles: [],
            keywords: [],
            bio: 'Test',
          },
        ],
        edges: [],
      }

      expect(() => parseGraphData(seedData)).toThrow('Duplicate node ID')
    })

    it('should throw error on edge with unknown source', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [
          {
            sourceId: 'unknown-source',
            targetId: 'startup-1',
            type: 'co-founded',
          },
        ],
      }

      expect(() => parseGraphData(seedData)).toThrow('unknown source node')
    })

    it('should throw error on edge with unknown target', () => {
      const seedData: SeedData = {
        startups: [
          {
            id: 'startup-1',
            name: 'Test',
            domainTags: [],
            stage: 'seed',
            foundedYear: 2020,
            location: 'SF',
            description: 'Test',
          },
        ],
        people: [],
        edges: [
          {
            sourceId: 'startup-1',
            targetId: 'unknown-target',
            type: 'co-founded',
          },
        ],
      }

      expect(() => parseGraphData(seedData)).toThrow('unknown target node')
    })
  })

  describe('loadAndParseGraphData', () => {
    it('should load and parse graph data successfully', () => {
      const graphData = loadAndParseGraphData()
      expect(graphData.nodes.length).toBeGreaterThan(0)
      expect(graphData.edges.length).toBeGreaterThan(0)
    })

    it('should return valid graph structure', () => {
      const graphData = loadAndParseGraphData()
      expect(graphData).toHaveProperty('nodes')
      expect(graphData).toHaveProperty('edges')
      expect(Array.isArray(graphData.nodes)).toBe(true)
      expect(Array.isArray(graphData.edges)).toBe(true)
    })

    it('should have nodes with correct structure', () => {
      const graphData = loadAndParseGraphData()
      const node = graphData.nodes[0]
      expect(node).toHaveProperty('id')
      expect(node).toHaveProperty('type')
      expect(node).toHaveProperty('data')
      expect(['startup', 'person']).toContain(node.type)
    })

    it('should have edges with correct structure', () => {
      const graphData = loadAndParseGraphData()
      if (graphData.edges.length > 0) {
        const edge = graphData.edges[0]
        expect(edge).toHaveProperty('id')
        expect(edge).toHaveProperty('source')
        expect(edge).toHaveProperty('target')
        expect(edge).toHaveProperty('type')
      }
    })
  })
})

