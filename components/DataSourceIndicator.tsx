'use client'

interface DataSourceIndicatorProps {
  dataSource: 'github' | 'crunchbase' | 'seed'
}

export default function DataSourceIndicator({ dataSource }: DataSourceIndicatorProps) {
  const getLabel = () => {
    switch (dataSource) {
      case 'github':
        return 'GitHub'
      case 'crunchbase':
        return 'Crunchbase'
      case 'seed':
        return 'Seed Data'
      default:
        return 'Unknown'
    }
  }

  const getStyles = () => {
    switch (dataSource) {
      case 'github':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'crunchbase':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'seed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`px-2 py-1 text-xs font-semibold rounded border ${getStyles()}`}>
      Data: {getLabel()}
    </div>
  )
}

