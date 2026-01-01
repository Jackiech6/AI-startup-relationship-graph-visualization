# GitHub API Integration

This document describes the GitHub API integration for the AI Startup Ecosystem Graph application. **GitHub API is the primary data source** (enabled by default) for fetching real-world startup data. It's free and provides comprehensive access to organizations, repositories, and contributors.

## Overview

The application now supports fetching data from the GitHub API, providing access to organizations, repositories, contributors, and tech stacks. The integration includes:

- **GitHub API Client**: Handles API requests with rate limiting and retry logic
- **Data Transformation**: Maps GitHub data to our internal data structures
- **Intelligent Inference**: Infers funding stage, domain tags, and relationships from repository data
- **Caching**: In-memory cache with TTL to reduce API calls
- **Fallback Mechanism**: Automatically falls back to Crunchbase (if enabled) or seed data on errors

## Why GitHub API?

### Advantages

1. **Free**: No subscription required
2. **High Rate Limits**: 5,000 requests/hour with token (60/hour without)
3. **Rich Data**: Repositories, contributors, languages, activity
4. **Real-time**: Data is always up-to-date
5. **Tech Stack**: Direct access to technologies used
6. **Relationships**: Clear contributor-organization relationships

### Limitations

1. **Funding Stage**: Must be inferred (not directly available)
2. **Not All Startups**: Only startups with GitHub presence
3. **Limited Company Info**: Less business data than Crunchbase
4. **Rate Limits**: Need token for high-volume usage

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# GitHub API Configuration (Primary Data Source - Enabled by Default)
GITHUB_ENABLED=true                    # Set to 'false' to disable (default: true)
GITHUB_API_KEY=your_github_token_here  # Optional but recommended (5,000 req/hour vs 60)
GITHUB_BASE_URL=https://api.github.com
GITHUB_CACHE_TTL=86400000              # 24 hours in milliseconds
GITHUB_FALLBACK_TO_SEED=true           # Fallback to seed data on errors
GITHUB_MAX_RETRIES=3                   # Number of retry attempts
GITHUB_RATE_LIMIT_DELAY=100            # Delay between requests (ms)
GITHUB_SEARCH_QUERIES=AI startup,machine learning,artificial intelligence
```

### Getting a GitHub Token (Optional but Recommended)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "AI Startup Graph")
4. Select scope: `public_repo` (read-only access to public repositories)
5. Generate and copy the token
6. Add it to your `.env.local` as `GITHUB_API_KEY`

**Why use a token?**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

## Architecture

### Data Flow

```
┌──────────────┐
│  GitHub API  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ GitHub Client│ (Rate limiting, retries)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Transform    │ (Map to internal types, infer fields)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Cache        │ (In-memory with TTL)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Graph Data   │
└──────────────┘
       │
       ▼ (on error)
┌──────────────┐
│ Crunchbase   │ (Fallback)
└──────┬───────┘
       │
       ▼ (on error)
┌──────────────┐
│ Seed Data    │ (Final fallback)
└──────────────┘
```

### Priority Order

1. **Cache** (if available and not expired)
2. **GitHub API** (if enabled)
3. **Crunchbase API** (if enabled)
4. **Seed Data** (always available)

## Data Mapping

### GitHub → Startup Mapping

| GitHub Field | Our Field | Transformation |
|-------------|-----------|---------------|
| `login` | `id` | Direct (e.g., "openai") |
| `name` | `name` | Direct or use `login` if null |
| `description` | `description` | Direct |
| `location` | `location` | Direct |
| `created_at` | `foundedYear` | Extract year from ISO date |
| Repository languages | `domainTags` | Top 3 languages, map to domain tags |
| Heuristic | `stage` | Infer from repo count, stars, age |

### GitHub → Person Mapping

| GitHub Field | Our Field | Transformation |
|-------------|-----------|---------------|
| `login` | `id` | Direct |
| `name` | `name` | Direct or use `login` |
| `bio` | `bio` | Direct |
| Repository languages | `keywords` | From user's public repos |
| Contribution level | `roles` | Infer "Founder" or "Contributor" |

### Relationship Mapping

- Repository contributors → `co-founded` or `works-at` edges
- First contribution date → `sinceYear`
- Contribution count determines relationship type

## Inference Heuristics

### Funding Stage Inference

The system infers funding stage from repository data:

- **Seed**: < 10 repos, < 100 stars, < 2 years old
- **Series A**: 10-50 repos, 100-1000 stars, 2-5 years old
- **Series B+**: 50+ repos, 1000+ stars, 5+ years old
- **Growth**: 10000+ stars

### Domain Tag Mapping

Languages are mapped to domain tags:

- Python → Machine Learning
- JavaScript/TypeScript → Web Development
- Java/C# → Enterprise Software
- Go/Rust → Infrastructure/Systems Programming
- And more...

### Relationship Type Inference

- **Co-founded**: High contributions (>50) in early repos (< 6 months old)
- **Works-at**: Other contributors

## Usage

### GitHub Integration Status

**GitHub is enabled by default** - no configuration needed to get started!

To customize:
1. (Optional) Add your `GITHUB_API_KEY` for higher rate limits (5,000 req/hour vs 60)
2. (Optional) Set `GITHUB_ENABLED=false` to disable GitHub API
3. (Optional) Customize `GITHUB_SEARCH_QUERIES` to search for different types of organizations
4. Restart your development server after changes

### Manual Refresh

To force a refresh of data from GitHub:

```bash
curl -X POST http://localhost:3000/api/graph/refresh
```

### Checking Data Source

To see which data source is being used:

```bash
curl http://localhost:3000/api/graph/stats
```

Response:
```json
{
  "dataSource": "github",
  "githubEnabled": true,
  "crunchbaseEnabled": false,
  "cacheEnabled": true,
  "cacheStats": {
    "size": 1,
    "keys": ["graph-data"],
    "isCached": true,
    "isExpired": false
  },
  "config": {
    "github": {
      "fallbackToSeed": true,
      "cacheTTL": 86400000
    },
    "crunchbase": {
      "fallbackToSeed": true,
      "cacheTTL": 86400000
    }
  }
}
```

## API Endpoints

### GET `/api/graph`

Returns graph data. Priority:
1. Cache (if available)
2. GitHub (if enabled)
3. Crunchbase (if enabled)
4. Seed data

### POST `/api/graph/refresh`

Forces refresh from active data source (GitHub or Crunchbase).

### GET `/api/graph/stats`

Returns data source information and cache status.

## Error Handling

The integration includes comprehensive error handling:

1. **API Errors**: Retries with exponential backoff
2. **Rate Limiting**: Automatic delay and retry (respects `Retry-After` header)
3. **Network Errors**: Falls back to next data source
4. **Invalid Data**: Validates with Zod schemas, skips bad records
5. **Missing API Key**: Works without token (lower rate limits)

## Caching Strategy

- **Cache Key**: `graph-data`
- **Default TTL**: 24 hours (86400000 ms)
- **Cache Type**: In-memory (resets on server restart)
- **Invalidation**: Manual via `/api/graph/refresh` endpoint

## Rate Limiting

The client implements rate limiting to respect GitHub API limits:

- **Default Delay**: 100ms between requests
- **Retry Logic**: Up to 3 retries with exponential backoff
- **403 Handling**: Respects `Retry-After` header for rate limits

## Testing

Tests are included for:

- GitHub client functionality (`__tests__/github-client.test.ts`)
- Data transformation (`__tests__/github-transformation.test.ts`)

Run tests:
```bash
npm test
```

## Comparison: GitHub vs Crunchbase

| Feature | GitHub API | Crunchbase API |
|---------|-----------|----------------|
| **Cost** | Free | Paid subscription |
| **Rate Limit** | 5,000/hour (with token) | Varies by tier |
| **Data Quality** | Tech-focused, real-time | Business-focused, curated |
| **Funding Stage** | Inferred | Direct |
| **Tech Stack** | Direct (languages) | Categories |
| **Relationships** | Contributors | Founders, investors |
| **Coverage** | GitHub users only | All startups |

## Best Practices

1. **Use a GitHub Token**: Significantly increases rate limits
2. **Enable Caching**: Reduces API calls and improves performance
3. **Set Fallback**: Always enable fallback to seed data
4. **Monitor Rate Limits**: Check response headers for rate limit status
5. **Combine Sources**: Use both GitHub and Crunchbase for comprehensive data

## Troubleshooting

### Rate Limit Errors

If you see 403 errors:
- Add a GitHub token to increase rate limits
- Increase `GITHUB_RATE_LIMIT_DELAY`
- Check rate limit status in response headers

### No Data Returned

If no data is returned:
- Check that `GITHUB_ENABLED=true`
- Verify search queries match organizations on GitHub
- Check server logs for error messages
- Ensure `GITHUB_FALLBACK_TO_SEED=true` for fallback

### Missing Fields

Some fields are inferred and may not be accurate:
- Funding stage is heuristic-based
- Domain tags depend on repository languages
- Relationships inferred from contribution patterns

## Future Enhancements

- [ ] Support for GitHub GraphQL API (more efficient)
- [ ] Better funding stage inference using additional signals
- [ ] Support for private repositories (with proper auth)
- [ ] Background job for periodic data refresh
- [ ] More sophisticated relationship detection
- [ ] Integration with GitHub Actions for real-time updates

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variable configuration
3. Test API connectivity with curl or Postman
4. Review GitHub API documentation: https://docs.github.com/en/rest

