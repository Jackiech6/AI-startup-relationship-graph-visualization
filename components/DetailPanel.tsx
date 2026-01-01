'use client'

import { useMemo, useState } from 'react'
import { getNeighbors } from '@/lib/graph-utils'
import type { GraphNode, GraphEdge, Startup, Person, CompanyStage } from '@/lib/types'

interface DetailPanelProps {
  node: GraphNode | null
  allNodes: GraphNode[]
  allEdges: GraphEdge[]
  onNodeClick: (nodeId: string) => void
  onClose: () => void
}

const formatStageLabel = (stage: CompanyStage): string => {
  return stage
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function DetailPanel({
  node,
  allNodes,
  allEdges,
  onNodeClick,
  onClose,
}: DetailPanelProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const connectedNodes = useMemo(() => {
    if (!node) return []
    return getNeighbors(node.id, allNodes, allEdges)
  }, [node, allNodes, allEdges])

  const handleGenerateSummary = async () => {
    if (!node) return

    setAiLoading(true)
    setAiError(null)
    setAiSummary(null)

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: node.id,
          mode: node.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const data = await response.json()
      setAiSummary(data.summary)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setAiLoading(false)
    }
  }

  if (!node) return null

  const isStartup = node.type === 'startup'
  const data = node.data as Startup | Person

  return (
    <div className="w-full md:w-96 bg-white border-l border-gray-200 h-full overflow-y-auto shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Node type indicator */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isStartup
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isStartup ? 'Startup' : 'Person'}
          </span>
        </div>

        {/* Name */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h3>
        </div>

        {/* AI Summary Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">AI Summary</h4>
            <button
              onClick={handleGenerateSummary}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {aiLoading ? 'Generating...' : aiSummary ? 'Regenerate' : 'Generate'}
            </button>
          </div>
          {aiLoading && (
            <div className="text-sm text-gray-500 italic">Generating summary...</div>
          )}
          {aiError && (
            <div className="text-sm text-red-600 mt-2">Error: {aiError}</div>
          )}
          {aiSummary && (
            <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{aiSummary}</div>
          )}
          {!aiSummary && !aiLoading && !aiError && (
            <div className="text-sm text-gray-500 italic">
              Click &quot;Generate&quot; to get an AI-powered summary
            </div>
          )}
        </div>

        {/* Startup-specific fields */}
        {isStartup && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Stage</h4>
              <p className="text-gray-800">{formatStageLabel((data as Startup).stage)}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Domain Tags</h4>
              <div className="flex flex-wrap gap-2">
                {(data as Startup).domainTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Founded</h4>
              <p className="text-gray-800">{(data as Startup).foundedYear}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Location</h4>
              <p className="text-gray-800">{(data as Startup).location}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Description</h4>
              <p className="text-gray-700">{(data as Startup).description}</p>
            </div>
          </>
        )}

        {/* Person-specific fields */}
        {!isStartup && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {(data as Person).roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {(data as Person).keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Bio</h4>
              <p className="text-gray-700">{(data as Person).bio}</p>
            </div>
          </>
        )}

        {/* Connected nodes */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">
            Connected ({connectedNodes.length})
          </h4>
          {connectedNodes.length > 0 ? (
            <div className="space-y-2">
              {connectedNodes.map((connectedNode) => (
                <button
                  key={connectedNode.id}
                  onClick={() => onNodeClick(connectedNode.id)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        connectedNode.type === 'startup' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                    ></span>
                    <span className="font-medium text-gray-800">
                      {connectedNode.data.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {connectedNode.type === 'startup' ? 'Startup' : 'Person'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No connections</p>
          )}
        </div>
      </div>
    </div>
  )
}
