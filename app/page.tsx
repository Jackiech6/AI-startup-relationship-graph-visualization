'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { ReactFlowProvider } from 'reactflow'
import GraphCanvas from '@/components/GraphCanvas'
import SearchBar from '@/components/SearchBar'
import FilterPanel from '@/components/FilterPanel'
import DetailPanel from '@/components/DetailPanel'
import { filterGraph, findNodeById } from '@/lib/graph-utils'
import type { GraphNode, GraphEdge, FilterCriteria, CompanyStage } from '@/lib/types'

export default function Home() {
  const [allNodes, setAllNodes] = useState<GraphNode[]>([])
  const [allEdges, setAllEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomainTags, setSelectedDomainTags] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<CompanyStage[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGraphData() {
      try {
        const response = await fetch('/api/graph')
        if (!response.ok) {
          throw new Error('Failed to fetch graph data')
        }
        const data = await response.json()
        setAllNodes(data.nodes)
        setAllEdges(data.edges)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [])

  // Extract unique domain tags from all nodes
  const domainTags = useMemo(() => {
    const tags = new Set<string>()
    allNodes.forEach((node) => {
      if (node.type === 'startup') {
        const startup = node.data as { domainTags: string[] }
        startup.domainTags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [allNodes])

  // Apply filters
  const filteredGraph = useMemo(() => {
    if (allNodes.length === 0) return { nodes: [], edges: [] }

    const criteria: FilterCriteria = {}
    if (searchTerm.trim()) {
      criteria.searchTerm = searchTerm.trim()
    }
    if (selectedDomainTags.length > 0) {
      criteria.domainTags = selectedDomainTags
    }
    if (selectedStages.length > 0) {
      criteria.stages = selectedStages
    }

    // Only filter if there are actual criteria
    if (Object.keys(criteria).length === 0) {
      return { nodes: allNodes, edges: allEdges }
    }

    return filterGraph({ nodes: allNodes, edges: allEdges }, criteria)
  }, [allNodes, allEdges, searchTerm, selectedDomainTags, selectedStages])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    return findNodeById(allNodes, selectedNodeId) || null
  }, [selectedNodeId, allNodes])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading graph...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <main className="w-full h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          AI Startup Ecosystem Graph
        </h1>
        <div className="w-full md:flex-1 md:max-w-md">
          <SearchBar onSearchChange={handleSearchChange} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar - Filters */}
        <div className="hidden lg:block w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <FilterPanel
            domainTags={domainTags}
            selectedDomainTags={selectedDomainTags}
            selectedStages={selectedStages}
            onDomainTagChange={setSelectedDomainTags}
            onStageChange={setSelectedStages}
          />
        </div>

        {/* Graph canvas */}
        <div className="flex-1 min-w-0">
          <ReactFlowProvider>
            <GraphCanvas
              nodes={filteredGraph.nodes}
              edges={filteredGraph.edges}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
            />
          </ReactFlowProvider>
        </div>

        {/* Right sidebar - Detail Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 z-10 lg:relative lg:z-auto">
            <DetailPanel
              node={selectedNode}
              allNodes={allNodes}
              allEdges={allEdges}
              onNodeClick={handleNodeClick}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </main>
  )
}
