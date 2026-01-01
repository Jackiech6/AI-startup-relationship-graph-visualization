/**
 * Application configuration
 */
export const config = {
  crunchbase: {
    enabled: process.env.CRUNCHBASE_ENABLED === 'true',
    apiKey: process.env.CRUNCHBASE_API_KEY || '',
    baseUrl: process.env.CRUNCHBASE_BASE_URL || 'https://api.crunchbase.com/v4',
    cacheTTL: parseInt(process.env.CRUNCHBASE_CACHE_TTL || '86400000', 10), // 24 hours in ms
    fallbackToSeed: process.env.CRUNCHBASE_FALLBACK_TO_SEED !== 'false',
    maxRetries: parseInt(process.env.CRUNCHBASE_MAX_RETRIES || '3', 10),
    rateLimitDelay: parseInt(process.env.CRUNCHBASE_RATE_LIMIT_DELAY || '1000', 10),
  },
  github: {
    enabled: process.env.GITHUB_ENABLED === 'true',
    apiKey: process.env.GITHUB_API_KEY || '',
    baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
    cacheTTL: parseInt(process.env.GITHUB_CACHE_TTL || '86400000', 10), // 24 hours in ms
    fallbackToSeed: process.env.GITHUB_FALLBACK_TO_SEED !== 'false',
    maxRetries: parseInt(process.env.GITHUB_MAX_RETRIES || '3', 10),
    rateLimitDelay: parseInt(process.env.GITHUB_RATE_LIMIT_DELAY || '100', 10),
    searchQueries: (process.env.GITHUB_SEARCH_QUERIES || 'AI startup,machine learning,artificial intelligence').split(','),
  },
}

