'use client'

import type { CompanyStage } from '@/lib/types'

interface FilterPanelProps {
  domainTags: string[]
  selectedDomainTags: string[]
  selectedStages: CompanyStage[]
  onDomainTagChange: (tags: string[]) => void
  onStageChange: (stages: CompanyStage[]) => void
}

const ALL_STAGES: CompanyStage[] = [
  'idea',
  'seed',
  'series-a',
  'series-b',
  'series-c',
  'series-d',
  'growth',
  'ipo',
  'acquired',
]

export default function FilterPanel({
  domainTags,
  selectedDomainTags,
  selectedStages,
  onDomainTagChange,
  onStageChange,
}: FilterPanelProps) {
  const handleDomainTagToggle = (tag: string) => {
    if (selectedDomainTags.includes(tag)) {
      onDomainTagChange(selectedDomainTags.filter((t) => t !== tag))
    } else {
      onDomainTagChange([...selectedDomainTags, tag])
    }
  }

  const handleStageToggle = (stage: CompanyStage) => {
    if (selectedStages.includes(stage)) {
      onStageChange(selectedStages.filter((s) => s !== stage))
    } else {
      onStageChange([...selectedStages, stage])
    }
  }

  const formatStageLabel = (stage: CompanyStage): string => {
    return stage
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Domain Tags</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {domainTags.map((tag) => (
            <label key={tag} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDomainTags.includes(tag)}
                onChange={() => handleDomainTagToggle(tag)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Company Stage</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ALL_STAGES.map((stage) => (
            <label key={stage} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStages.includes(stage)}
                onChange={() => handleStageToggle(stage)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{formatStageLabel(stage)}</span>
            </label>
          ))}
        </div>
      </div>

      {(selectedDomainTags.length > 0 || selectedStages.length > 0) && (
        <button
          onClick={() => {
            onDomainTagChange([])
            onStageChange([])
          }}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

