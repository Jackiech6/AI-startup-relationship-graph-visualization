import { NextResponse } from 'next/server'
import { loadAndParseGraphData } from '@/lib/data'
import { dataCache } from '@/lib/cache'
import { config } from '@/lib/config'
import type { GraphApiResponse } from '@/lib/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/graph/refresh
 * Force refresh graph data from active API (GitHub or Crunchbase) - clears cache
 */
export async function POST(): Promise<NextResponse<GraphApiResponse | { error: string }>> {
  try {
    // Check if any API is enabled
    if (!config.github.enabled && !config.crunchbase.enabled) {
      return NextResponse.json(
        {
          error: 'No API is enabled',
          message: 'Set GITHUB_ENABLED=true or CRUNCHBASE_ENABLED=true to enable API integration',
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

