import { NextResponse } from 'next/server'
import { loadAndParseGraphData } from '@/lib/data'
import type { GraphApiResponse } from '@/lib/types'

/**
 * GET /api/graph
 * Returns the graph data in React Flow format
 * Supports Crunchbase API (with caching) or seed data fallback
 */
export async function GET(): Promise<NextResponse<GraphApiResponse | { error: string }>> {
  try {
    const graphData = await loadAndParseGraphData()

    return NextResponse.json({
      nodes: graphData.nodes,
      edges: graphData.edges,
    } satisfies GraphApiResponse)
  } catch (error) {
    console.error('Error loading graph data:', error)
    return NextResponse.json(
      {
        error: 'Failed to load graph data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

