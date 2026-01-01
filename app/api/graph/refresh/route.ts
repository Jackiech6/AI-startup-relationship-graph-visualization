import { NextResponse } from 'next/server'
import { loadAndParseGraphData } from '@/lib/data'
import { dataCache } from '@/lib/cache'
import { config } from '@/lib/config'
import type { GraphApiResponse } from '@/lib/types'

/**
 * POST /api/graph/refresh
 * Force refresh graph data from Crunchbase API (clears cache)
 */
export async function POST(): Promise<NextResponse<GraphApiResponse | { error: string }>> {
  try {
    if (!config.crunchbase.enabled) {
      return NextResponse.json(
        {
          error: 'Crunchbase API is not enabled',
          message: 'Set CRUNCHBASE_ENABLED=true to enable API integration',
        },
        { status: 400 }
      )
    }

    // Clear cache
    dataCache.invalidate('graph-data')

    // Fetch fresh data
    const graphData = await loadAndParseGraphData()

    return NextResponse.json({
      nodes: graphData.nodes,
      edges: graphData.edges,
    } satisfies GraphApiResponse)
  } catch (error) {
    console.error('Error refreshing graph data:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh graph data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

