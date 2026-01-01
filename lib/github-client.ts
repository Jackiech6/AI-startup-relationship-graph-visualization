/**
 * GitHub API client
 * Handles fetching organizations, repositories, contributors, and relationships from GitHub API
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import { config } from './config'
import type { Startup, Person, Edge, CompanyStage } from './types'

/**
 * GitHub API response types
 */
interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubOrganization[]
}

interface GitHubOrganization {
  login: string
  id: number
  node_id: string
  url: string
  repos_url: string
  events_url: string
  hooks_url: string
  issues_url: string
  members_url: string
  public_members_url: string
  avatar_url: string
  description: string | null
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  twitter_username: string | null
  is_verified: boolean
  has_organization_projects: boolean
  has_repository_projects: boolean
  public_repos: number
  public_gists: number
  followers: number
  following: number
  html_url: string
  created_at: string
  updated_at: string
  type: string
}

interface GitHubRepository {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: GitHubOrganization
  html_url: string
  description: string | null
  fork: boolean
  url: string
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  languages_url: string
  forks_count: number
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
    spdx_id: string
    url: string
  } | null
  allow_forking: boolean
  is_template: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}

interface GitHubContributor {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  contributions: number
}

interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
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
 * Language to domain tag mapping
 */
function mapLanguageToDomainTag(language: string): string {
  const mapping: Record<string, string> = {
    Python: 'Machine Learning',
    JavaScript: 'Web Development',
    TypeScript: 'Web Development',
    Java: 'Enterprise Software',
    Go: 'Infrastructure',
    Rust: 'Systems Programming',
    'C++': 'Systems Programming',
    C: 'Systems Programming',
    Swift: 'Mobile Development',
    Kotlin: 'Mobile Development',
    Dart: 'Mobile Development',
    PHP: 'Web Development',
    Ruby: 'Web Development',
    'C#': 'Enterprise Software',
    Scala: 'Data Engineering',
    R: 'Data Science',
    MATLAB: 'Data Science',
    Julia: 'Data Science',
    HTML: 'Web Development',
    CSS: 'Web Development',
    Shell: 'DevOps',
    Dockerfile: 'DevOps',
    YAML: 'DevOps',
    JSON: 'Data Processing',
    SQL: 'Data Engineering',
    Vue: 'Web Development',
    React: 'Web Development',
    Angular: 'Web Development',
    Node: 'Web Development',
    TensorFlow: 'Machine Learning',
    PyTorch: 'Machine Learning',
    Jupyter: 'Data Science',
  }
  return mapping[language] || language
}

/**
 * GitHub API client
 */
class GitHubClient {
  private apiKey?: string
  private baseUrl: string
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private maxRetries: number

  constructor() {
    this.apiKey = config.github.apiKey || undefined
    this.baseUrl = config.github.baseUrl
    this.maxRetries = config.github.maxRetries
    this.rateLimiter = new RateLimiter(config.github.rateLimitDelay)

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Startup-Ecosystem-Graph',
    }

    if (this.apiKey) {
      headers.Authorization = `token ${this.apiKey}`
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers,
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
      const status = axiosError.response?.status

      // Don't retry 404 errors (resource doesn't exist)
      if (status === 404) {
        throw error
      }

      if (status === 403) {
        // Rate limit - check headers
        const retryAfter = parseInt(
          axiosError.response?.headers['retry-after'] || '60',
          10
        )
        console.warn(`GitHub rate limit hit, waiting ${retryAfter} seconds`)
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
        return this.retryRequest(requestFn, retries - 1)
      }

      if (status && status >= 500) {
        // Server error - retry with exponential backoff
        const delay = Math.pow(2, this.maxRetries - retries) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.retryRequest(requestFn, retries - 1)
      }

      throw error
    }
  }

  /**
   * Search for organizations
   */
  async fetchOrganizations(query: string, limit: number = 30): Promise<GitHubOrganization[]> {
    const requestFn = async () => {
      const response = await this.client.get<GitHubSearchResponse>('/search/users', {
        params: {
          q: `${query} type:org`,
          per_page: Math.min(limit, 100),
          sort: 'joined',
          order: 'desc',
        },
      })

      return response.data.items
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch repositories for an organization
   */
  async fetchOrganizationRepos(orgLogin: string): Promise<GitHubRepository[]> {
    const requestFn = async () => {
      const response = await this.client.get<GitHubRepository[]>(`/orgs/${orgLogin}/repos`, {
        params: {
          type: 'all',
          sort: 'updated',
          per_page: 100,
        },
      })

      return response.data
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch contributors for a repository
   */
  async fetchRepoContributors(
    owner: string,
    repo: string
  ): Promise<GitHubContributor[]> {
    const requestFn = async () => {
      try {
        const response = await this.client.get<GitHubContributor[]>(
          `/repos/${owner}/${repo}/contributors`,
          {
            params: {
              per_page: 30,
            },
          }
        )
        return response.data
      } catch (error) {
        const axiosError = error as AxiosError
        // 204 means no content (empty repo)
        if (axiosError.response?.status === 204) {
          return []
        }
        throw error
      }
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch repository languages
   */
  async fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const requestFn = async () => {
      const response = await this.client.get<Record<string, number>>(
        `/repos/${owner}/${repo}/languages`
      )
      return response.data
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Fetch user details
   */
  async fetchUser(login: string): Promise<GitHubUser> {
    const requestFn = async () => {
      const response = await this.client.get<GitHubUser>(`/users/${login}`)
      return response.data
    }

    return this.retryRequest(requestFn)
  }

  /**
   * Infer funding stage from organization and repository data
   */
  private inferFundingStage(
    org: GitHubOrganization,
    repos: GitHubRepository[]
  ): CompanyStage {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const repoCount = repos.length
    const orgAge = new Date().getFullYear() - new Date(org.created_at).getFullYear()

    // Heuristic-based inference
    if (repoCount < 10 && totalStars < 100 && orgAge < 2) {
      return 'seed'
    } else if (repoCount < 50 && totalStars < 1000 && orgAge < 5) {
      return 'series-a'
    } else if (repoCount >= 50 && totalStars >= 1000 && orgAge >= 5) {
      return 'series-b'
    } else if (totalStars >= 10000) {
      return 'growth'
    }

    // Default to seed for new/small orgs
    return 'seed'
  }

  /**
   * Extract domain tags from repository languages
   */
  private extractDomainTags(languages: Record<string, number>): string[] {
    // Sort languages by usage
    const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1])
    // Get top 3 languages and map to domain tags
    const topLanguages = sorted.slice(0, 3).map(([lang]) => lang)
    const domainTags = topLanguages.map(mapLanguageToDomainTag)
    // Remove duplicates
    return [...new Set(domainTags)]
  }

  /**
   * Map GitHub organization to our Startup type
   */
  mapGitHubToStartup(org: GitHubOrganization, repos: GitHubRepository[]): Startup {
    const foundedYear = new Date(org.created_at).getFullYear()

    // Aggregate languages from all repositories
    const allLanguages: Record<string, number> = {}
    // We'll fetch languages for top repos, but for now use repo language field
    repos.forEach((repo) => {
      if (repo.language) {
        allLanguages[repo.language] = (allLanguages[repo.language] || 0) + 1
      }
    })

    const domainTags = this.extractDomainTags(allLanguages)
    const stage = this.inferFundingStage(org, repos)

    return {
      id: org.login,
      name: org.name || org.login,
      domainTags: domainTags.length > 0 ? domainTags : ['Software'],
      stage,
      foundedYear,
      location: org.location || 'Unknown',
      description: org.description || '',
    }
  }

  /**
   * Map GitHub user to our Person type
   */
  mapGitHubToPerson(user: GitHubUser): Person {
    // Extract keywords from bio and company
    const keywords: string[] = []
    if (user.bio) {
      // Simple keyword extraction from bio
      const bioKeywords = user.bio
        .split(/[,\s]+/)
        .filter((word) => word.length > 3)
        .slice(0, 5)
      keywords.push(...bioKeywords)
    }
    if (user.company) {
      keywords.push(user.company.replace('@', ''))
    }

    return {
      id: user.login,
      name: user.name || user.login,
      roles: [], // Will be inferred from contribution level
      keywords: keywords.length > 0 ? keywords : ['Developer'],
      bio: user.bio || `GitHub user ${user.login}`,
    }
  }

  /**
   * Map contributor to edge
   */
  mapContributorToEdge(
    contributor: GitHubContributor,
    orgId: string,
    repoCreatedAt?: string
  ): Edge {
    // Infer relationship type based on contribution count
    // High contributors in early repos are likely founders
    const isFounder = contributor.contributions > 50 && repoCreatedAt
      ? new Date(repoCreatedAt).getTime() > Date.now() - 6 * 30 * 24 * 60 * 60 * 1000 // Within 6 months
      : false

    const sinceYear = repoCreatedAt ? new Date(repoCreatedAt).getFullYear() : undefined

    return {
      sourceId: contributor.login,
      targetId: orgId,
      type: isFounder ? 'co-founded' : 'works-at',
      sinceYear,
    }
  }
}

// Export singleton instance
let clientInstance: GitHubClient | null = null

export function getGitHubClient(): GitHubClient {
  if (!clientInstance) {
    if (!config.github.enabled) {
      throw new Error('GitHub client is not enabled. Set GITHUB_ENABLED=true')
    }
    clientInstance = new GitHubClient()
  }
  return clientInstance
}

// Export types for use in other modules
export type {
  GitHubOrganization,
  GitHubRepository,
  GitHubContributor,
  GitHubUser,
}

