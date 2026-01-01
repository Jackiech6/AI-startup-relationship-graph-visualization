'use client'

import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Node,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import StartupNode from './nodes/StartupNode'
import PersonNode from './nodes/PersonNode'
import { calculateLayout } from '@/lib/layout'
import type { GraphNode, GraphEdge as GraphEdgeType } from '@/lib/types'

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdgeType[]
  onNodeClick?: (nodeId: string) => void
  selectedNodeId?: string | null
}

const nodeTypes: NodeTypes = {
  startup: StartupNode,
  person: PersonNode,
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: GraphCanvasProps) {
  const { fitView } = useReactFlow()

  // Calculate layout positions using Dagre to prevent overlap
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return []
    
    // Use dagre to calculate proper positions with structured layout
    return calculateLayout(nodes, edges, 'LR')
  }, [nodes, edges])

  // Transform GraphNode to ReactFlow Node format
  const reactFlowNodes: Node[] = useMemo(() => {
    return positionedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: {
        ...node.data,
        label: node.data.name,
        selected: selectedNodeId === node.id,
      },
      position: node.position || { x: 0, y: 0 },
    }))
  }, [positionedNodes, selectedNodeId])

  // Transform GraphEdge to ReactFlow Edge format
  const reactFlowEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep' as const,
        animated: false,
        label: edge.label,
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        markerEnd: 'arrowclosed' as const,
      })),
    [edges]
  )

  const [reactNodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [reactEdges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(reactFlowNodes)
    setEdges(reactFlowEdges)
    
    // Fit view after layout calculation with smooth animation
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges, fitView])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation()
      onNodeClick?.(node.id)
    },
    [onNodeClick]
  )

  const onPaneClick = useCallback(() => {
    // Pane click handled by parent if needed
  }, [])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={reactNodes}
        edges={reactEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'startup') return '#3b82f6'
            if (node.type === 'person') return '#10b981'
            return '#94a3b8'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
      </ReactFlow>
    </div>
  )
}

