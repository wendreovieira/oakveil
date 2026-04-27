import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadAsset } from '@/api/assets'
import { createDefinition } from '@/api/definitions'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TextureEditorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [tags, setTags] = useState('')
  const [frameWidth, setFrameWidth] = useState<number | ''>('')
  const [frameHeight, setFrameHeight] = useState<number | ''>('')

  const uploadMutation = useMutation({
    mutationFn: (targetFile: File) => uploadAsset(targetFile, { folder: 'textures', isPublic: true }),
    onSuccess: (data) => setUrl(data.url)
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      createDefinition('texture', {
        Key: key,
        Path: url,
        PixelPerfect: true,
        FrameWidth: frameWidth || null,
        FrameHeight: frameHeight || null,
        Tags: tags
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      })
  })

  const framePreview = useMemo(() => {
    if (!url || !frameWidth || !frameHeight) {
      return null
    }

    return (
      <div className='mt-2 rounded-md border border-border p-2'>
        <p className='mb-2 text-xs text-muted-foreground'>Sprite sheet frame preview (first frame crop)</p>
        <div
          className='h-32 w-32 rounded border border-border bg-cover bg-no-repeat'
          style={{
            backgroundImage: `url(${url})`,
            backgroundPosition: '0 0',
            backgroundSize: 'auto'
          }}
        />
      </div>
    )
  }, [url, frameWidth, frameHeight])

  return (
    <div>
      <PageHeader title='Texture Editor' description='Upload sprites, set tags and sprite sheet frame config.' />

      <Card>
        <CardContent className='grid gap-6 pt-5 lg:grid-cols-2'>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Definition Key</label>
              <Input value={key} onChange={(event) => setKey(event.target.value)} placeholder='texture.player_idle' />
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Tags (comma separated)</label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder='player, idle, spritesheet' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Frame Width</label>
                <Input type='number' value={frameWidth} onChange={(event) => setFrameWidth(event.target.value ? Number(event.target.value) : '')} />
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Frame Height</label>
                <Input type='number' value={frameHeight} onChange={(event) => setFrameHeight(event.target.value ? Number(event.target.value) : '')} />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Upload image</label>
              <Input type='file' accept='image/*' onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              <div className='flex gap-2'>
                <Button disabled={!file || uploadMutation.isPending} onClick={() => file && uploadMutation.mutate(file)}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
                <Button variant='secondary' disabled={!url || !key || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                  Save Definition
                </Button>
              </div>
            </div>

            {url ? <Badge>Uploaded URL ready</Badge> : null}
          </div>

          <div>
            <div className='rounded-md border border-border p-3'>
              <p className='mb-2 text-sm font-medium'>Texture Preview</p>
              {url ? <img src={url} alt='Texture preview' className='max-h-96 w-full rounded object-contain' /> : <p className='text-sm text-muted-foreground'>No image uploaded yet.</p>}
              {framePreview}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
