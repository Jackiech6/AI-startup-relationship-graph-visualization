'use client'

import { useState } from 'react'

interface RefreshButtonProps {
  onRefreshComplete?: () => void
}

export default function RefreshButton({ onRefreshComplete }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/graph/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh data')
      }

      setSuccess(true)
      if (onRefreshComplete) {
        onRefreshComplete()
      }

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        title="Refresh data from active API"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600" title={error}>
          Error
        </span>
      )}
      {success && (
        <span className="text-xs text-green-600">Refreshed</span>
      )}
    </div>
  )
}

