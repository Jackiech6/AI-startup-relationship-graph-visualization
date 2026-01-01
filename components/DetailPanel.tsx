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
  dataSource?: 'github' | 'crunchbase' | 'seed'
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
  dataSource,
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
          {/* GitHub profile link if data source is GitHub */}
          {dataSource === 'github' && (
            <a
              href={`https://github.com/${node.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          )}
        </div>

        {/* Data Source Info */}
        {dataSource && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs ${
              dataSource === 'github'
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : dataSource === 'crunchbase'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <div className="font-semibold mb-1">
              Data Source: {dataSource === 'github' ? 'GitHub API' : dataSource === 'crunchbase' ? 'Crunchbase API' : 'Seed Data'}
            </div>
            {dataSource === 'github' && (
              <div className="text-purple-600 mt-1">
                <span className="font-medium">Note:</span> Some fields (stage, domain tags) are estimated from repository data.
              </div>
            )}
          </div>
        )}

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
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-600">Stage</h4>
                {dataSource === 'github' && (
                  <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                    Estimated
                  </span>
                )}
              </div>
              <p className="text-gray-800">{formatStageLabel((data as Startup).stage)}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-gray-600">Domain Tags</h4>
                {dataSource === 'github' && (
                  <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                    Estimated
                  </span>
                )}
              </div>
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
