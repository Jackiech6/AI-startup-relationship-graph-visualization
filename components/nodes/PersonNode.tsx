'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import type { Person } from '@/lib/types'

interface PersonNodeData extends Person {
  label?: string
  selected?: boolean
}

export default function PersonNode({ data, selected }: NodeProps<PersonNodeData>) {
  return (
    <div
      className={`px-4 py-2 shadow-lg rounded-full border-2 bg-white min-w-[120px] ${
        selected ? 'border-green-500 shadow-xl ring-2 ring-green-300' : 'border-green-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <div className="font-semibold text-green-700 text-sm">{data.name}</div>
        </div>
        {data.roles && data.roles.length > 0 && (
          <div className="text-xs text-gray-600">{data.roles[0]}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

