/**
 * Tests to verify project setup and configuration
 */
import type {
  Startup,
  Person,
  Edge,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
} from '@/lib/types'

describe('Project Setup', () => {
  it('should have proper test environment', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })

  it('should be able to import TypeScript type definitions', () => {
    // TypeScript types are compile-time only, so we just verify the import works
    // by creating instances that satisfy the types
    const startup: Startup = {
      id: 'test',
      name: 'Test',
      domainTags: [],
      stage: 'seed',
      foundedYear: 2020,
      location: 'Test',
      description: 'Test',
    }

    const person: Person = {
      id: 'test',
      name: 'Test',
      roles: [],
      keywords: [],
      bio: 'Test',
    }

    const edge: Edge = {
      sourceId: 'test',
      targetId: 'test',
      type: 'co-founded',
    }

    expect(startup).toBeDefined()
    expect(person).toBeDefined()
    expect(edge).toBeDefined()
  })

  it('should have type definitions available', () => {
    // Verify type assignments work (compile-time check, runtime is just a no-op)
    const nodeType: NodeType = 'startup'
    const edgeType: EdgeType = 'co-founded'

    expect(nodeType).toBe('startup')
    expect(edgeType).toBe('co-founded')
  })
})

describe('Path Aliases', () => {
  it('should resolve @/ alias correctly', () => {
    // Verify we can import from @/ alias by using the types
    const testStartup: Startup = {
      id: 'test',
      name: 'Test',
      domainTags: [],
      stage: 'seed',
      foundedYear: 2020,
      location: 'Test',
      description: 'Test',
    }
    expect(testStartup).toBeDefined()
  })
})
