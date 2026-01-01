/**
 * Tests for type definitions and type safety
 */
import {
  NodeType,
  EdgeType,
  CompanyStage,
  Startup,
  Person,
  Edge,
  GraphNode,
  GraphEdge,
  GraphData,
  SeedData,
  FilterCriteria,
} from '@/lib/types'

describe('Type Definitions', () => {
  describe('NodeType', () => {
    it('should accept valid node types', () => {
      const validTypes: NodeType[] = ['startup', 'person']
      expect(validTypes).toHaveLength(2)
    })
  })

  describe('EdgeType', () => {
    it('should accept valid edge types', () => {
      const validTypes: EdgeType[] = ['co-founded', 'works-at', 'invests-in']
      expect(validTypes).toHaveLength(3)
    })
  })

  describe('CompanyStage', () => {
    it('should accept valid company stages', () => {
      const validStages: CompanyStage[] = [
        'idea',
        'seed',
        'series-a',
        'series-b',
        'series-c',
        'series-d',
        'growth',
        'ipo',
        'acquired',
      ]
      expect(validStages).toHaveLength(9)
    })
  })

  describe('Startup interface', () => {
    it('should have all required fields', () => {
      const startup: Startup = {
        id: 'startup-1',
        name: 'Test Startup',
        domainTags: ['AI', 'ML'],
        stage: 'seed',
        foundedYear: 2020,
        location: 'San Francisco, CA',
        description: 'A test startup',
      }

      expect(startup.id).toBe('startup-1')
      expect(startup.name).toBe('Test Startup')
      expect(startup.domainTags).toEqual(['AI', 'ML'])
      expect(startup.stage).toBe('seed')
      expect(startup.foundedYear).toBe(2020)
      expect(startup.location).toBe('San Francisco, CA')
      expect(startup.description).toBe('A test startup')
    })
  })

  describe('Person interface', () => {
    it('should have all required fields', () => {
      const person: Person = {
        id: 'person-1',
        name: 'John Doe',
        roles: ['Founder', 'CEO'],
        keywords: ['AI', 'entrepreneurship'],
        bio: 'A test person',
      }

      expect(person.id).toBe('person-1')
      expect(person.name).toBe('John Doe')
      expect(person.roles).toEqual(['Founder', 'CEO'])
      expect(person.keywords).toEqual(['AI', 'entrepreneurship'])
      expect(person.bio).toBe('A test person')
    })
  })

  describe('Edge interface', () => {
    it('should have all required fields', () => {
      const edge: Edge = {
        sourceId: 'person-1',
        targetId: 'startup-1',
        type: 'co-founded',
        sinceYear: 2020,
      }

      expect(edge.sourceId).toBe('person-1')
      expect(edge.targetId).toBe('startup-1')
      expect(edge.type).toBe('co-founded')
      expect(edge.sinceYear).toBe(2020)
    })

    it('should allow optional sinceYear', () => {
      const edge: Edge = {
        sourceId: 'person-1',
        targetId: 'startup-1',
        type: 'co-founded',
      }

      expect(edge.sinceYear).toBeUndefined()
    })
  })

  describe('GraphNode interface', () => {
    it('should properly structure a graph node', () => {
      const startup: Startup = {
        id: 'startup-1',
        name: 'Test Startup',
        domainTags: ['AI'],
        stage: 'seed',
        foundedYear: 2020,
        location: 'SF',
        description: 'Test',
      }

      const node: GraphNode = {
        id: 'startup-1',
        type: 'startup',
        data: startup,
        position: { x: 100, y: 200 },
      }

      expect(node.id).toBe('startup-1')
      expect(node.type).toBe('startup')
      expect(node.data).toEqual(startup)
      expect(node.position).toEqual({ x: 100, y: 200 })
    })
  })

  describe('GraphEdge interface', () => {
    it('should properly structure a graph edge', () => {
      const edge: GraphEdge = {
        id: 'edge-1',
        source: 'person-1',
        target: 'startup-1',
        type: 'co-founded',
        label: 'Co-founded',
        data: { sinceYear: 2020 },
      }

      expect(edge.id).toBe('edge-1')
      expect(edge.source).toBe('person-1')
      expect(edge.target).toBe('startup-1')
      expect(edge.type).toBe('co-founded')
      expect(edge.label).toBe('Co-founded')
      expect(edge.data?.sinceYear).toBe(2020)
    })
  })

  describe('GraphData interface', () => {
    it('should properly structure graph data', () => {
      const node: GraphNode = {
        id: 'startup-1',
        type: 'startup',
        data: {
          id: 'startup-1',
          name: 'Test',
          domainTags: [],
          stage: 'seed',
          foundedYear: 2020,
          location: 'SF',
          description: 'Test',
        },
      }

      const edge: GraphEdge = {
        id: 'edge-1',
        source: 'person-1',
        target: 'startup-1',
        type: 'co-founded',
      }

      const graphData: GraphData = {
        nodes: [node],
        edges: [edge],
      }

      expect(graphData.nodes).toHaveLength(1)
      expect(graphData.edges).toHaveLength(1)
    })
  })

  describe('SeedData interface', () => {
    it('should properly structure seed data', () => {
      const seedData: SeedData = {
        startups: [],
        people: [],
        edges: [],
      }

      expect(seedData.startups).toEqual([])
      expect(seedData.people).toEqual([])
      expect(seedData.edges).toEqual([])
    })
  })

  describe('FilterCriteria interface', () => {
    it('should allow all optional fields', () => {
      const criteria1: FilterCriteria = {
        domainTags: ['AI', 'ML'],
      }
      expect(criteria1.domainTags).toEqual(['AI', 'ML'])

      const criteria2: FilterCriteria = {
        stages: ['seed', 'series-a'],
      }
      expect(criteria2.stages).toEqual(['seed', 'series-a'])

      const criteria3: FilterCriteria = {
        searchTerm: 'test',
      }
      expect(criteria3.searchTerm).toBe('test')

      const criteria4: FilterCriteria = {}
      expect(criteria4).toEqual({})
    })
  })
})

