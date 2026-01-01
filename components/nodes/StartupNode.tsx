'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import type { Startup } from '@/lib/types'

interface StartupNodeData extends Startup {
  label?: string
  selected?: boolean
}

export default function StartupNode({ data, selected }: NodeProps<StartupNodeData>) {
  return (
    <div
      className={`px-4 py-2 shadow-lg rounded-lg border-2 bg-white min-w-[150px] ${
        selected ? 'border-blue-500 shadow-xl ring-2 ring-blue-300' : 'border-blue-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <div className="font-bold text-blue-700 text-sm">{data.name}</div>
        </div>
        <div className="text-xs text-gray-600 capitalize">{data.stage}</div>
        {data.domainTags && data.domainTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 justify-center">
            {data.domainTags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

