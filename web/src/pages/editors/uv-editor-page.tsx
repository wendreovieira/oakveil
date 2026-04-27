import { useState } from 'react'
import { Layer, Rect, Stage, Circle, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function TextureLayer({ url }: { url: string }) {
  const [image] = useImage(url)
  if (!image) return null
  return <KonvaImage image={image} x={0} y={0} width={image.width} height={image.height} />
}

export function UvEditorPage() {
  const [textureUrl, setTextureUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [rect, setRect] = useState({ x: 80, y: 80, width: 120, height: 90 })
  const [pivot, setPivot] = useState({ x: 140, y: 120 })

  return (
    <div>
      <PageHeader title='UV Editor' description='Select UV regions and pivot points over a texture.' />

      <Card className='mb-4'>
        <CardContent className='pt-5'>
          <div className='grid gap-3 md:grid-cols-[1fr_auto]'>
            <Input value={textureUrl} onChange={(event) => setTextureUrl(event.target.value)} placeholder='Paste texture URL or signed URL...' />
            <Button onClick={() => setActiveUrl(textureUrl)}>Load Texture</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='pt-5'>
          <div className='overflow-auto rounded-md border border-border editor-grid'>
            <Stage width={960} height={560}>
              <Layer>
                {activeUrl ? <TextureLayer url={activeUrl} /> : null}
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  stroke='#00d5c8'
                  strokeWidth={2}
                  draggable
                  onDragEnd={(event) => setRect((prev) => ({ ...prev, x: event.target.x(), y: event.target.y() }))}
                />
                <Circle
                  x={pivot.x}
                  y={pivot.y}
                  radius={6}
                  fill='#ff8b57'
                  draggable
                  onDragEnd={(event) => setPivot({ x: event.target.x(), y: event.target.y() })}
                />
              </Layer>
            </Stage>
          </div>

          <div className='mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2'>
            <p>
              UV Rect: x {Math.round(rect.x)} y {Math.round(rect.y)} w {Math.round(rect.width)} h {Math.round(rect.height)}
            </p>
            <p>
              Pivot: x {Math.round(pivot.x)} y {Math.round(pivot.y)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
