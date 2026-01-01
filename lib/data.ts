/**
 * Data loading and parsing utilities
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { config } from './config'
import { dataCache } from './cache'
import { getCrunchbaseClient } from './crunchbase-client'
import { getGitHubClient } from './github-client'
import type {
  SeedData,
  Startup,
  Person,
  Edge,
  GraphNode,
  GraphEdge,
  GraphData,
} from './types'
import type {
  CrunchbaseOrganization,
  CrunchbasePerson,
  CrunchbaseRelationship,
} from './crunchbase-client'
import type {
  GitHubOrganization,
  GitHubRepository,
  GitHubContributor,
} from './github-client'

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
 * Transform Crunchbase organizations to Startup array
 */
export function transformCrunchbaseOrganizations(
  orgs: CrunchbaseOrganization[]
): Startup[] {
  const client = getCrunchbaseClient()
  return orgs.map((org) => client.mapCrunchbaseToStartup(org))
}

/**
 * Transform Crunchbase people to Person array
 */
export function transformCrunchbasePeople(people: CrunchbasePerson[]): Person[] {
  const client = getCrunchbaseClient()
  return people.map((person) => client.mapCrunchbaseToPerson(person))
}

/**
 * Transform Crunchbase relationships to Edge array
 */
export function transformCrunchbaseRelationships(
  relationships: CrunchbaseRelationship[],
  personId: string,
  organizationId: string
): Edge[] {
  const client = getCrunchbaseClient()
  return relationships.map((rel) =>
    client.mapCrunchbaseToEdge(rel, personId, organizationId)
  )
}

/**
 * Transform GitHub organizations to Startup array
 */
export function transformGitHubOrganizations(
  orgs: GitHubOrganization[],
  reposMap: Map<string, GitHubRepository[]>
): Startup[] {
  const client = getGitHubClient()
  return orgs.map((org) => {
    const repos = reposMap.get(org.login) || []
    return client.mapGitHubToStartup(org, repos)
  })
}


/**
 * Transform GitHub contributors to Edge array
 */
export function transformGitHubContributorsToEdges(
  contributors: GitHubContributor[],
  orgId: string,
  repoCreatedAt?: string
): Edge[] {
  const client = getGitHubClient()
  return contributors.map((contributor) =>
    client.mapContributorToEdge(contributor, orgId, repoCreatedAt)
  )
}

/**
 * Extract domain tags from Crunchbase categories
 */
export function extractDomainTags(
  categories: Array<{ value: string }> | undefined
): string[] {
  if (!categories) {
    return []
  }
  return categories.map((cat) => cat.value)
}

/**
 * Normalize funding stage from Crunchbase format
 */
export function normalizeFundingStage(crunchbaseStage?: string): string {
  if (!crunchbaseStage) {
    return 'seed'
  }
  return crunchbaseStage.toLowerCase().replace(/_/g, '-')
}

/**
 * Fetch data from Crunchbase API
 */
async function fetchFromCrunchbase(): Promise<SeedData> {
  const client = getCrunchbaseClient()

  // Fetch organizations
  const organizations = await client.fetchOrganizations({ limit: 100 })
  const startups = transformCrunchbaseOrganizations(organizations)

  // Fetch people (founders)
  const peopleData = await client.fetchPeople({ limit: 100 })
  const people = transformCrunchbasePeople(peopleData)

  // Build edges from founder relationships
  const edges: Edge[] = []
  for (const org of organizations) {
    try {
      const relationships = await client.fetchFounderRelationships(org.uuid)
      for (const rel of relationships) {
        if (rel.relationships?.person?.uuid) {
          const personId = rel.relationships.person.uuid
          const edge = client.mapCrunchbaseToEdge(rel, personId, org.uuid)
          edges.push(edge)
        }
      }
    } catch (error) {
      // Skip if relationship fetch fails
      console.warn(`Failed to fetch relationships for ${org.uuid}:`, error)
    }
  }

  return {
    startups,
    people,
    edges,
  }
}

/**
 * Fetch data from GitHub API
 */
async function fetchFromGitHub(): Promise<SeedData> {
  const client = getGitHubClient()
  const startups: Startup[] = []
  const people: Person[] = []
  const edges: Edge[] = []
  const peopleMap = new Map<string, Person>()

  // Search for organizations using configured search queries
  const allOrgs: GitHubOrganization[] = []
  for (const query of config.github.searchQueries) {
    try {
      const orgs = await client.fetchOrganizations(query, 20)
      allOrgs.push(...orgs)
    } catch (error) {
      console.warn(`Failed to fetch organizations for query "${query}":`, error)
    }
  }

  // Remove duplicates
  const uniqueOrgs = Array.from(
    new Map(allOrgs.map((org) => [org.login, org])).values()
  ).slice(0, 50) // Limit to 50 organizations

  // Fetch repositories for each organization
  const reposMap = new Map<string, GitHubRepository[]>()
  for (const org of uniqueOrgs) {
    try {
      const repos = await client.fetchOrganizationRepos(org.login)
      reposMap.set(org.login, repos)

      // Create startup from org and repos
      const startup = client.mapGitHubToStartup(org, repos)
      startups.push(startup)

      // Get contributors from top repos (limit to top 5 to avoid too many API calls)
      const topRepos = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)

      for (const repo of topRepos) {
        try {
          const contributors = await client.fetchRepoContributors(org.login, repo.name)

          for (const contributor of contributors.slice(0, 10)) {
            // Limit to top 10 contributors per repo
            // Fetch user details if not already fetched
            if (!peopleMap.has(contributor.login)) {
              try {
                const user = await client.fetchUser(contributor.login)
                const person = client.mapGitHubToPerson(user)
                peopleMap.set(contributor.login, person)
                people.push(person)
              } catch (error: unknown) {
                // Skip 404 errors (user doesn't exist) - don't log as warning
                const axiosError = error as { response?: { status?: number } }
                if (axiosError.response?.status === 404) {
                  continue // Skip this user
                }
                console.warn(`Failed to fetch user ${contributor.login}:`, error)
                // Create minimal person from contributor data
                const person: Person = {
                  id: contributor.login,
                  name: contributor.login,
                  roles: [],
                  keywords: ['Developer'],
                  bio: `GitHub contributor: ${contributor.login}`,
                }
                peopleMap.set(contributor.login, person)
                people.push(person)
              }
            }

            // Create edge
            const edge = client.mapContributorToEdge(
              contributor,
              startup.id,
              repo.created_at
            )
            edges.push(edge)
          }
        } catch (error: unknown) {
          // Skip 404 errors silently (repo might not exist or be private)
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status !== 404) {
            console.warn(
              `Failed to fetch contributors for ${org.login}/${repo.name}:`,
              error
            )
          }
        }
      }
    } catch (error: unknown) {
      // Skip 404 errors silently (org might not exist)
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status !== 404) {
        console.warn(`Failed to fetch repos for ${org.login}:`, error)
      }
    }
  }

  return {
    startups,
    people,
    edges,
  }
}

/**
 * Load and validate seed data, then parse to graph format
 * Now supports multiple data sources: GitHub API → Crunchbase API (with cache) → seed data fallback
 */
export async function loadAndParseGraphData(): Promise<GraphData> {
  const cacheKey = 'graph-data'

  // 1. Try to load from cache
  const cached = dataCache.get(cacheKey)
  if (cached) {
    return parseGraphData(cached)
  }

  // 2. Try GitHub API if enabled (primary data source, enabled by default)
  if (config.github.enabled) {
    try {
      const githubData = await fetchFromGitHub()
      const validated = validateData(githubData)

      // Cache the result
      dataCache.set(cacheKey, validated, config.github.cacheTTL)

      return parseGraphData(validated)
    } catch (error) {
      console.error('GitHub API failed:', error)

      // Fall through to other sources if fallback is enabled
      if (!config.github.fallbackToSeed) {
        throw error
      }
    }
  }

  // 3. Try Crunchbase API if enabled
  if (config.crunchbase.enabled) {
    try {
      const crunchbaseData = await fetchFromCrunchbase()
      const validated = validateData(crunchbaseData)

      // Cache the result
      dataCache.set(cacheKey, validated, config.crunchbase.cacheTTL)

      return parseGraphData(validated)
    } catch (error) {
      console.error('Crunchbase API failed:', error)

      // Fall through to seed data if fallback is enabled
      if (!config.crunchbase.fallbackToSeed) {
        throw error
      }
    }
  }

  // 4. Fallback to seed data
  const seedData = loadSeedData()
  const validatedData = validateData(seedData)
  return parseGraphData(validatedData)
}

