import { useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Keyframe = {
  time: number
  x: number
  y: number
  rotation: number
  scale: number
  uvVariant?: string
}

export function RigAnimationEditorPage() {
  const [slotName, setSlotName] = useState('body')
  const [keyframes, setKeyframes] = useState<Keyframe[]>([{ time: 0, x: 120, y: 100, rotation: 0, scale: 1 }])
  const [currentTime, setCurrentTime] = useState(0)

  const active = keyframes.reduce((closest, frame) => (Math.abs(frame.time - currentTime) < Math.abs(closest.time - currentTime) ? frame : closest), keyframes[0])

  return (
    <div>
      <PageHeader title='Rig Animation Editor' description='Timeline + keyframe editor for per-slot transform and UV switching.' />

      <Card className='mb-4'>
        <CardContent className='pt-5'>
          <div className='grid gap-3 md:grid-cols-[180px_1fr_auto]'>
            <Input value={slotName} onChange={(event) => setSlotName(event.target.value)} placeholder='slot track name' />
            <input type='range' min={0} max={3000} step={50} value={currentTime} onChange={(event) => setCurrentTime(Number(event.target.value))} />
            <Button
              onClick={() =>
                setKeyframes((prev) => [
                  ...prev,
                  { time: currentTime, x: 120 + Math.random() * 90, y: 100 + Math.random() * 60, rotation: Math.random() * 30, scale: 1 }
                ])
              }
            >
              Add keyframe
            </Button>
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>Current time: {currentTime}ms - active keyframe at {active.time}ms</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='grid gap-4 pt-5 lg:grid-cols-2'>
          <div className='rounded-md border border-border p-2 editor-grid'>
            <Stage width={520} height={320}>
              <Layer>
                <Rect
                  x={active.x}
                  y={active.y}
                  width={80 * active.scale}
                  height={80 * active.scale}
                  fill='#1dd1c1'
                  rotation={active.rotation}
                  offsetX={40}
                  offsetY={40}
                />
              </Layer>
            </Stage>
          </div>

          <div className='rounded-md border border-border p-3'>
            <h3 className='mb-2 text-sm font-semibold'>Track: {slotName}</h3>
            <div className='max-h-72 space-y-2 overflow-auto'>
              {keyframes.map((frame, idx) => (
                <div key={`${frame.time}-${idx}`} className='rounded bg-muted/40 p-2 text-xs'>
                  <div>t={frame.time}ms</div>
                  <div>
                    x={Math.round(frame.x)} y={Math.round(frame.y)} rot={frame.rotation.toFixed(1)} scale={frame.scale.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
