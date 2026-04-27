import { useCallback } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node
} from 'reactflow'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const initialNodes: Node[] = [
  { id: 'start', position: { x: 80, y: 80 }, data: { label: 'Start' }, type: 'input' },
  { id: 'choice', position: { x: 320, y: 140 }, data: { label: 'Choice' } }
]

const initialEdges: Edge[] = [{ id: 'e1-2', source: 'start', target: 'choice' }]

export function GraphEditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges])

  return (
    <div>
      <PageHeader title='Quest / Interaction Graph Editor' description='React Flow powered branching narrative and interaction graph canvas.' />

      <Card>
        <CardContent className='pt-5'>
          <div className='mb-3 flex gap-2'>
            <Button
              onClick={() =>
                setNodes((prev) => [
                  ...prev,
                  {
                    id: `node-${prev.length + 1}`,
                    position: { x: 120 + prev.length * 40, y: 220 + prev.length * 30 },
                    data: { label: `Node ${prev.length + 1}` }
                  }
                ])
              }
            >
              Add Node
            </Button>
            <Button variant='secondary'>Save Graph JSON</Button>
          </div>

          <div className='h-[560px] rounded-md border border-border'>
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
