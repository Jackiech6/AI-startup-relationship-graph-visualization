/**
 * Data loading and parsing utilities
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import type {
  SeedData,
  Startup,
  Person,
  Edge,
  GraphNode,
  GraphEdge,
  GraphData,
} from './types'

/**
 * Zod schemas for runtime validation
 */
const CompanyStageSchema = z.enum([
  'idea',
  'seed',
  'series-a',
  'series-b',
  'series-c',
  'series-d',
  'growth',
  'ipo',
  'acquired',
])

const EdgeTypeSchema = z.enum(['co-founded', 'works-at', 'invests-in'])

const StartupSchema: z.ZodType<Startup> = z.object({
  id: z.string(),
  name: z.string(),
  domainTags: z.array(z.string()),
  stage: CompanyStageSchema,
  foundedYear: z.number().int().min(1900).max(2100),
  location: z.string(),
  description: z.string(),
})

const PersonSchema: z.ZodType<Person> = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
  keywords: z.array(z.string()),
  bio: z.string(),
})

const EdgeSchema: z.ZodType<Edge> = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: EdgeTypeSchema,
  sinceYear: z.number().int().min(1900).max(2100).optional(),
})

const SeedDataSchema: z.ZodType<SeedData> = z.object({
  startups: z.array(StartupSchema),
  people: z.array(PersonSchema),
  edges: z.array(EdgeSchema),
})

/**
 * Load seed data from JSON file
 */
export function loadSeedData(): SeedData {
  try {
    const filePath = join(process.cwd(), 'data', 'seed.json')
    const fileContents = readFileSync(filePath, 'utf-8')
    const rawData = JSON.parse(fileContents)
    return rawData as SeedData
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load seed data: ${error.message}`)
    }
    throw new Error('Failed to load seed data: Unknown error')
  }
}

/**
 * Validate seed data structure
 */
export function validateData(data: unknown): SeedData {
  try {
    return SeedDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new Error(`Data validation failed: ${errors}`)
    }
    throw new Error('Data validation failed: Unknown error')
  }
}

/**
 * Transform seed data to graph format for React Flow
 */
export function parseGraphData(seedData: SeedData): GraphData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // Create node lookup map for validation
  const nodeIdSet = new Set<string>()

  // Add startup nodes
  for (const startup of seedData.startups) {
    if (nodeIdSet.has(startup.id)) {
      throw new Error(`Duplicate node ID: ${startup.id}`)
    }
    nodeIdSet.add(startup.id)

    nodes.push({
      id: startup.id,
      type: 'startup',
      data: startup,
    })
  }

  // Add person nodes
  for (const person of seedData.people) {
    if (nodeIdSet.has(person.id)) {
      throw new Error(`Duplicate node ID: ${person.id}`)
    }
    nodeIdSet.add(person.id)

    nodes.push({
      id: person.id,
      type: 'person',
      data: person,
    })
  }

  // Add edges
  let edgeCounter = 0
  for (const edge of seedData.edges) {
    // Validate source and target exist
    if (!nodeIdSet.has(edge.sourceId)) {
      throw new Error(`Edge references unknown source node: ${edge.sourceId}`)
    }
    if (!nodeIdSet.has(edge.targetId)) {
      throw new Error(`Edge references unknown target node: ${edge.targetId}`)
    }

    edges.push({
      id: `edge-${edgeCounter++}`,
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.type,
      label: edge.type === 'co-founded' ? 'Co-founded' : undefined,
      data: edge.sinceYear ? { sinceYear: edge.sinceYear } : undefined,
    })
  }

  // Note: Position calculation happens on the client side in React Flow
  // Server-side layout calculation can be added later if needed
  return { nodes, edges }
}

/**
 * Load and validate seed data, then parse to graph format
 */
export function loadAndParseGraphData(): GraphData {
  const rawData = loadSeedData()
  const validatedData = validateData(rawData)
  return parseGraphData(validatedData)
}

