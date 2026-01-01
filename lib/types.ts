/**
 * Core type definitions for the AI Startup Ecosystem Graph application
 */

/**
 * Node types in the graph
 */
export type NodeType = 'startup' | 'person'

/**
 * Edge/relationship types in the graph
 */
export type EdgeType = 'co-founded' | 'works-at' | 'invests-in'

/**
 * Company stage types
 */
export type CompanyStage =
  | 'idea'
  | 'seed'
  | 'series-a'
  | 'series-b'
  | 'series-c'
  | 'series-d'
  | 'growth'
  | 'ipo'
  | 'acquired'

/**
 * Startup entity
 */
export interface Startup {
  id: string
  name: string
  domainTags: string[]
  stage: CompanyStage
  foundedYear: number
  location: string
  description: string
}

/**
 * Person entity
 */
export interface Person {
  id: string
  name: string
  roles: string[]
  keywords: string[]
  bio: string
}

/**
 * Union type for all entities
 */
export type Entity = Startup | Person

/**
 * Edge/relationship between entities
 */
export interface Edge {
  sourceId: string
  targetId: string
  type: EdgeType
  sinceYear?: number
}

/**
 * Graph node (for React Flow)
 */
export interface GraphNode {
  id: string
  type: NodeType
  data: Startup | Person
  position?: { x: number; y: number }
}

/**
 * Graph edge (for React Flow)
 */
export interface GraphEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  label?: string
  data?: {
    sinceYear?: number
  }
}

/**
 * Complete graph data structure
 */
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Seed data structure (as stored in JSON)
 */
export interface SeedData {
  startups: Startup[]
  people: Person[]
  edges: Edge[]
}

/**
 * API Response types
 */

/**
 * Response from GET /api/graph
 */
export interface GraphApiResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Request body for POST /api/ai/summary
 */
export interface AiSummaryRequest {
  nodeId: string
  mode: 'startup' | 'person'
}

/**
 * Response from POST /api/ai/summary
 */
export interface AiSummaryResponse {
  summary: string
  cached?: boolean
}

/**
 * Filter criteria
 */
export interface FilterCriteria {
  domainTags?: string[]
  stages?: CompanyStage[]
  searchTerm?: string
}

/**
 * Error response type
 */
export interface ApiError {
  error: string
  message: string
  statusCode?: number
}

