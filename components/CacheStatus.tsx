'use client'

interface CacheStatusProps {
  isCached: boolean
  isExpired: boolean
  timestamp: number | null
}

export default function CacheStatus({ isCached, isExpired, timestamp }: CacheStatusProps) {
  const formatTimestamp = (ts: number | null): string => {
    if (!ts) return 'Never'
    const date = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  if (!isCached) {
    return (
      <div className="text-xs text-gray-500">
        <span className="px-2 py-1 bg-gray-100 rounded">Fresh</span>
      </div>
    )
  }

  return (
    <div className="text-xs text-gray-500">
      <span
        className={`px-2 py-1 rounded ${
          isExpired ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}
        title={timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'}
      >
        {isExpired ? 'Expired' : 'Cached'} • {formatTimestamp(timestamp)}
      </span>
    </div>
  )
}

