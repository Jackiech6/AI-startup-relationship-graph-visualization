import { NextResponse } from 'next/server'
import { dataCache } from '@/lib/cache'
import { config } from '@/lib/config'

/**
 * GET /api/graph/stats
 * Returns data source information (cache status, last update, etc.)
 */
export async function GET() {
  try {
    const cacheStats = dataCache.getStats()
    const cacheKey = 'graph-data'
    const isCached = dataCache.get(cacheKey) !== null
    const isExpired = isCached ? dataCache.isExpired(cacheKey) : true

    return NextResponse.json({
      dataSource: config.crunchbase.enabled ? 'crunchbase' : 'seed',
      crunchbaseEnabled: config.crunchbase.enabled,
      cacheEnabled: true,
      cacheStats: {
        size: cacheStats.size,
        keys: cacheStats.keys,
        isCached,
        isExpired,
      },
      config: {
        fallbackToSeed: config.crunchbase.fallbackToSeed,
        cacheTTL: config.crunchbase.cacheTTL,
      },
    })
  } catch (error) {
    console.error('Error getting graph stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to get graph stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

