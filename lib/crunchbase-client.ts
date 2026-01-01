/**
 * Crunchbase API client
 * Handles fetching organizations, people, and relationships from Crunchbase API
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import { config } from './config'
import type { Startup, Person, Edge, CompanyStage } from './types'

/**
 * Crunchbase API response types
 */
interface CrunchbaseResponse<T> {
  data: {
    items: T[]
    paging?: {
      total_items: number
      number_of_pages: number
      current_page: number
      sort_order: string[]
    }
  }
}

interface CrunchbaseOrganization {
  uuid: string
  properties: {
    name?: string
    categories?: Array<{ value: string }>
    funding_stage?: string
    founded_on?: string
    location_identifiers?: Array<{ value: string }>
    short_description?: string
  }
}

interface CrunchbasePerson {
  uuid: string
  properties: {
    name?: string
    job_title?: string
    bio?: string
    experience?: Array<{
      title?: string
      organization_name?: string
      description?: string
    }>
  }
}

interface CrunchbaseRelationship {
  uuid: string
  properties: {
    started_on?: string
    ended_on?: string | null
  }
  relationships?: {
    person?: {
      uuid: string
      properties?: {
        name?: string
      }
    }
    organization?: {
      uuid: string
      properties?: {
        name?: string
      }
    }
  }
}

/**
 * Rate limiter to handle API rate limits
 */
class RateLimiter {
  private lastRequestTime: number = 0
  private delay: number

  constructor(delay: number) {
    this.delay = delay
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
  }
}

/**
 * Crunchbase API client
 */
class CrunchbaseClient {
  private apiKey: string
  private baseUrl: string
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private maxRetries: number

  constructor() {
    this.apiKey = config.crunchbase.apiKey
    this.baseUrl = config.crunchbase.baseUrl
    this.maxRetries = config.crunchbase.maxRetries
    this.rateLimiter = new RateLimiter(config.crunchbase.rateLimitDelay)

    if (!this.apiKey) {
      throw new Error('CRUNCHBASE_API_KEY is required')
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-cb-user-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })
  }

  /**
   * Retry a request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      await this.rateLimiter.wait()
      return await requestFn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }

      const axiosError = error as AxiosError
      if (axiosError.response?.status === 429) {
        // Rate limit - wait longer and retry
        const retryAfter = parseInt(
          axiosError.response.headers['retry-after'] || '5',
          10
        )
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
        return this.retryRequest(requestFn, retries - 1)
      }

      if (axiosError.response?.status && axiosError.response.status >= 500) {
        // Server error - retry with exponential backoff
        const delay = Math.pow(2, this.maxRetries - retries) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.retryRequest(requestFn, retries - 1)
      }

      throw error
    }
  }

  /**
   * Fetch organizations (startups) from Crunchbase
   */
  async fetchOrganizations(
    filters?: {
      categories?: string[]
      locations?: string[]
      limit?: number
    }
  ): Promise<CrunchbaseOrganization[]> {
    const requestFn = async () => {
      const params: Record<string, string> = {
        limit: String(filters?.limit || 100),
      }

      // Build query parameters
      if (filters?.categories && filters.categories.length > 0) {
        params.categories = filters.categories.join(',')
      }

      const response = await this.client.get<CrunchbaseResponse<CrunchbaseOrganization>>(
        '/searches/organizations',
        { params }
      )

      return response.data.data.items
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch people from Crunchbase
   */
  async fetchPeople(
    filters?: {
      limit?: number
    }
  ): Promise<CrunchbasePerson[]> {
    const requestFn = async () => {
      const params: Record<string, string> = {
        limit: String(filters?.limit || 100),
      }

      const response = await this.client.get<CrunchbaseResponse<CrunchbasePerson>>(
        '/searches/people',
        { params }
      )

      return response.data.data.items
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch founder relationships for an organization
   */
  async fetchFounderRelationships(organizationId: string): Promise<CrunchbaseRelationship[]> {
    const requestFn = async () => {
      const response = await this.client.get<CrunchbaseResponse<CrunchbaseRelationship>>(
        `/entities/organizations/${organizationId}/cards/founder_identifiers`
      )

      return response.data.data.items
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Map Crunchbase organization to our Startup type
   */
  mapCrunchbaseToStartup(org: CrunchbaseOrganization): Startup {
    const foundedOn = org.properties.founded_on
    const foundedYear = foundedOn ? new Date(foundedOn).getFullYear() : new Date().getFullYear()

    return {
      id: org.uuid,
      name: org.properties.name || 'Unknown',
      domainTags: org.properties.categories?.map((cat) => cat.value) || [],
      stage: this.normalizeFundingStage(org.properties.funding_stage),
      foundedYear,
      location:
        org.properties.location_identifiers
          ?.map((loc) => loc.value)
          .join(', ') || 'Unknown',
      description: org.properties.short_description || '',
    }
  }

  /**
   * Map Crunchbase person to our Person type
   */
  mapCrunchbaseToPerson(person: CrunchbasePerson): Person {
    const roles: string[] = []
    if (person.properties.job_title) {
      roles.push(person.properties.job_title)
    }

    const keywords: string[] = []
    if (person.properties.experience) {
      person.properties.experience.forEach((exp) => {
        if (exp.title) keywords.push(exp.title)
        if (exp.organization_name) keywords.push(exp.organization_name)
      })
    }

    return {
      id: person.uuid,
      name: person.properties.name || 'Unknown',
      roles,
      keywords: [...new Set(keywords)], // Remove duplicates
      bio: person.properties.bio || '',
    }
  }

  /**
   * Map Crunchbase relationship to our Edge type
   */
  mapCrunchbaseToEdge(relationship: CrunchbaseRelationship, sourceId: string, targetId: string): Edge {
    const startedOn = relationship.properties.started_on
    const sinceYear = startedOn ? new Date(startedOn).getFullYear() : undefined

    return {
      sourceId,
      targetId,
      type: 'co-founded',
      sinceYear,
    }
  }

  /**
   * Normalize Crunchbase funding stage to our CompanyStage enum
   */
  private normalizeFundingStage(crunchbaseStage?: string): CompanyStage {
    if (!crunchbaseStage) {
      return 'seed'
    }

    const stageMap: Record<string, CompanyStage> = {
      idea: 'idea',
      seed: 'seed',
      'series-a': 'series-a',
      'series-b': 'series-b',
      'series-c': 'series-c',
      'series-d': 'series-d',
      growth: 'growth',
      ipo: 'ipo',
      acquired: 'acquired',
    }

    const normalized = crunchbaseStage.toLowerCase().replace(/_/g, '-')
    return stageMap[normalized] || 'seed'
  }
}

// Export singleton instance
let clientInstance: CrunchbaseClient | null = null

export function getCrunchbaseClient(): CrunchbaseClient {
  if (!clientInstance) {
    if (!config.crunchbase.enabled || !config.crunchbase.apiKey) {
      throw new Error('Crunchbase client is not configured. Set CRUNCHBASE_ENABLED=true and CRUNCHBASE_API_KEY')
    }
    clientInstance = new CrunchbaseClient()
  }
  return clientInstance
}

// Export types for use in other modules
export type { CrunchbaseOrganization, CrunchbasePerson, CrunchbaseRelationship }

