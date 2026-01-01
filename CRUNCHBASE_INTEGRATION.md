# Crunchbase API Integration

This document describes the Crunchbase API integration for the AI Startup Ecosystem Graph application.

## Overview

The application now supports fetching real-world data from the Crunchbase API, with automatic fallback to seed data if the API is unavailable or disabled. The integration includes:

- **Crunchbase API Client**: Handles API requests with rate limiting and retry logic
- **Data Transformation**: Maps Crunchbase data to our internal data structures
- **Caching**: In-memory cache with TTL to reduce API calls
- **Fallback Mechanism**: Automatically falls back to seed data on errors

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Crunchbase API Configuration
CRUNCHBASE_ENABLED=false                    # Set to 'true' to enable
CRUNCHBASE_API_KEY=your_api_key_here        # Your Crunchbase API key
CRUNCHBASE_BASE_URL=https://api.crunchbase.com/v4
CRUNCHBASE_CACHE_TTL=86400000              # 24 hours in milliseconds
CRUNCHBASE_FALLBACK_TO_SEED=true           # Fallback to seed data on errors
CRUNCHBASE_MAX_RETRIES=3                   # Number of retry attempts
CRUNCHBASE_RATE_LIMIT_DELAY=1000           # Delay between requests (ms)
```

### Getting a Crunchbase API Key

1. Sign up for a Crunchbase account at https://www.crunchbase.com
2. Navigate to your account settings
3. Generate an API key from the API section
4. Copy the API key to your `.env.local` file

## Architecture

### Data Flow

```
┌─────────────────┐
│  Crunchbase API │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Client     │ (Rate limiting, retries)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transformation │ (Map to internal types)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cache          │ (In-memory with TTL)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │ (Zod schemas)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Graph Data     │
└─────────────────┘
         │
         ▼ (on error)
┌─────────────────┐
│  Seed Data      │ (Fallback)
└─────────────────┘
```

### Key Components

#### 1. Crunchbase Client (`lib/crunchbase-client.ts`)

- Handles all API communication
- Implements rate limiting and retry logic
- Maps Crunchbase data structures to our types

**Key Methods:**
- `fetchOrganizations()` - Fetch startup/company data
- `fetchPeople()` - Fetch person/founder data
- `fetchFounderRelationships()` - Fetch founder-company relationships
- `mapCrunchbaseToStartup()` - Transform organization data
- `mapCrunchbaseToPerson()` - Transform person data
- `mapCrunchbaseToEdge()` - Transform relationship data

#### 2. Data Cache (`lib/cache.ts`)

- In-memory cache with TTL support
- Reduces API calls by caching responses
- Automatic expiration handling

**Key Methods:**
- `get(key)` - Retrieve cached data
- `set(key, data, ttl)` - Store data in cache
- `invalidate(key)` - Remove specific cache entry
- `clear()` - Clear all cache entries

#### 3. Data Loading (`lib/data.ts`)

- Updated `loadAndParseGraphData()` to support multiple sources
- Implements fallback chain: Cache → Crunchbase → Seed Data
- Handles errors gracefully

#### 4. API Endpoints

**GET `/api/graph`**
- Returns graph data (from cache or API)
- Automatically falls back to seed data if needed

**POST `/api/graph/refresh`**
- Forces refresh from Crunchbase API
- Clears cache and fetches fresh data

**GET `/api/graph/stats`**
- Returns data source information
- Shows cache status and configuration

## Usage

### Enabling Crunchbase Integration

1. Set `CRUNCHBASE_ENABLED=true` in your `.env.local`
2. Add your `CRUNCHBASE_API_KEY`
3. Restart your development server

### Manual Refresh

To force a refresh of data from Crunchbase:

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
  "dataSource": "crunchbase",
  "crunchbaseEnabled": true,
  "cacheEnabled": true,
  "cacheStats": {
    "size": 1,
    "keys": ["graph-data"],
    "isCached": true,
    "isExpired": false
  },
  "config": {
    "fallbackToSeed": true,
    "cacheTTL": 86400000
  }
}
```

## Data Mapping

### Crunchbase → Startup

| Crunchbase Field | Our Field | Notes |
|-----------------|-----------|-------|
| `uuid` | `id` | Direct mapping |
| `properties.name` | `name` | Direct mapping |
| `properties.categories` | `domainTags` | Extract category values |
| `properties.funding_stage` | `stage` | Normalized to our enum |
| `properties.founded_on` | `foundedYear` | Extract year from date |
| `properties.location_identifiers` | `location` | Join location values |
| `properties.short_description` | `description` | Direct mapping |

### Crunchbase → Person

| Crunchbase Field | Our Field | Notes |
|-----------------|-----------|-------|
| `uuid` | `id` | Direct mapping |
| `properties.name` | `name` | Direct mapping |
| `properties.job_title` | `roles` | Array with single role |
| `properties.experience` | `keywords` | Extract titles and orgs |
| `properties.bio` | `bio` | Direct mapping |

### Relationships

- Founder relationships are mapped to `co-founded` edges
- `started_on` date is extracted as `sinceYear`
- Only active relationships (no `ended_on`) are included

## Error Handling

The integration includes comprehensive error handling:

1. **API Errors**: Retries with exponential backoff
2. **Rate Limiting**: Automatic delay and retry
3. **Network Errors**: Falls back to seed data
4. **Invalid Data**: Validates with Zod schemas, skips bad records
5. **Missing API Key**: Falls back to seed data with warning

## Caching Strategy

- **Cache Key**: `graph-data`
- **Default TTL**: 24 hours (86400000 ms)
- **Cache Type**: In-memory (resets on server restart)
- **Invalidation**: Manual via `/api/graph/refresh` endpoint

## Rate Limiting

The client implements rate limiting to respect Crunchbase API limits:

- **Default Delay**: 1000ms between requests
- **Retry Logic**: Up to 3 retries with exponential backoff
- **429 Handling**: Respects `Retry-After` header

## Testing

Tests are included for:

- Cache functionality (`__tests__/cache.test.ts`)
- Data transformation (`__tests__/data-transformation.test.ts`)
- Crunchbase client (`__tests__/crunchbase-client.test.ts`)

Run tests:
```bash
npm test
```

## Limitations

1. **API Structure**: The implementation assumes a specific Crunchbase API structure. If the API changes, the mapping functions may need updates.

2. **Rate Limits**: Crunchbase API has rate limits based on your subscription tier. The default delay may need adjustment.

3. **Data Completeness**: Not all Crunchbase fields are mapped. Additional fields can be added by extending the transformation functions.

4. **Cache Persistence**: Cache is in-memory and does not persist across server restarts. For production, consider using Redis or a database.

## Future Enhancements

- [ ] Database persistence for cache
- [ ] Background job for periodic data refresh
- [ ] Support for additional relationship types
- [ ] More comprehensive data mapping
- [ ] API response pagination support
- [ ] Webhook support for real-time updates

## Troubleshooting

### API Key Issues

If you see "CRUNCHBASE_API_KEY is required":
- Check that `CRUNCHBASE_ENABLED=true`
- Verify your API key is set in `.env.local`
- Restart your development server

### Rate Limit Errors

If you encounter 429 errors:
- Increase `CRUNCHBASE_RATE_LIMIT_DELAY`
- Reduce the number of concurrent requests
- Check your Crunchbase subscription tier limits

### Data Not Loading

If data doesn't load from Crunchbase:
- Check API key validity
- Verify network connectivity
- Check server logs for error messages
- Ensure `CRUNCHBASE_FALLBACK_TO_SEED=true` for fallback

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variable configuration
3. Test API connectivity with curl or Postman
4. Review Crunchbase API documentation

