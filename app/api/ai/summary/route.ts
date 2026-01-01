import { NextRequest, NextResponse } from 'next/server'
import { generateStartupSummary, generatePersonSummary } from '@/lib/ai-client'
import { loadAndParseGraphData } from '@/lib/data'
import { findNodeById, getNeighbors } from '@/lib/graph-utils'
import type { AiSummaryRequest, Startup, Person } from '@/lib/types'

interface AiSummaryResponse {
  summary: string
  cached?: boolean
  error?: string
}

// Mark this route as dynamic to prevent build-time analysis
export const dynamic = 'force-dynamic'

// Simple in-memory cache
const cache = new Map<string, { summary: string; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

function getCacheKey(nodeId: string, mode: string): string {
  return `${nodeId}-${mode}`
}

function getCachedSummary(nodeId: string, mode: string): string | null {
  const key = getCacheKey(nodeId, mode)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.summary
  }
  return null
}

function setCachedSummary(nodeId: string, mode: string, summary: string): void {
  const key = getCacheKey(nodeId, mode)
  cache.set(key, { summary, timestamp: Date.now() })
}

/**
 * POST /api/ai/summary
 * Generate AI summary for a node
 */
export async function POST(request: NextRequest): Promise<NextResponse<AiSummaryResponse>> {
  try {
    const body: AiSummaryRequest = await request.json()
    const { nodeId, mode } = body

    if (!nodeId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: nodeId and mode', summary: '' },
        { status: 400 }
      )
    }

    if (mode !== 'startup' && mode !== 'person') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "startup" or "person"', summary: '' },
        { status: 400 }
      )
    }

    // Check cache
    const cached = getCachedSummary(nodeId, mode)
    if (cached) {
      return NextResponse.json({ summary: cached, cached: true })
    }

    // Load graph data
    const graphData = await loadAndParseGraphData()
    const node = findNodeById(graphData.nodes, nodeId)

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found', summary: '' },
        { status: 404 }
      )
    }

    // Verify node type matches mode
    if (node.type !== mode) {
      return NextResponse.json(
        { error: `Node type mismatch. Expected ${mode}, got ${node.type}`, summary: '' },
        { status: 400 }
      )
    }

    // Get neighbors
    const neighbors = getNeighbors(nodeId, graphData.nodes, graphData.edges)

    // Generate summary
    let summary: string
    if (mode === 'startup') {
      summary = await generateStartupSummary(node.data as Startup, neighbors)
    } else {
      summary = await generatePersonSummary(node.data as Person, neighbors)
    }

    // Cache the result
    setCachedSummary(nodeId, mode, summary)

    return NextResponse.json({ summary, cached: false })
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate AI summary',
        summary: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

