import { useCallback, useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { uploadAsset } from '@/api/assets'
import { createDefinition } from '@/api/definitions'
import { TagInput } from '@/components/common/tag-input'

export type TextureResult = {
  textureId: string
  objectKey: string
  url: string
}

type Props = {
  value?: TextureResult | null
  onChange: (result: TextureResult | null) => void
  folder?: string
  className?: string
}

export function TextureUpload({ value, onChange, folder = 'textures', className }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [pixelPerfect, setPixelPerfect] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setIsUploading(true)
    try {
      // 1. Upload asset to R2
      const asset = await uploadAsset(file, { folder, isPublic: true })

      // 2. Auto-create TextureDefinition
      const textureDef = await createDefinition('texture', {
        path: asset.objectKey,
        pixelPerfect,
        tags,
      })

      onChange({ textureId: textureDef.id, objectKey: asset.objectKey, url: asset.url })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tags, pixelPerfect]
  )

  function clear() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const previewUrl = value?.url

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          'relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
          value && 'cursor-default'
        )}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
        />

        {isUploading ? (
          <p className='text-sm text-muted-foreground'>Uploading…</p>
        ) : previewUrl ? (
          <>
            <img src={previewUrl} alt='texture preview' className='max-h-[120px] rounded object-contain' />
            <button
              type='button'
              onClick={(e) => { e.stopPropagation(); clear() }}
              className='absolute right-2 top-2 rounded-full bg-destructive/10 p-1 hover:bg-destructive/20'
            >
              <X className='h-4 w-4 text-destructive' />
            </button>
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Upload className='h-6 w-6' />
              <ImageIcon className='h-6 w-6' />
            </div>
            <p className='text-sm'>Drag & drop or click to upload</p>
            <p className='text-xs'>PNG, WEBP, JPG accepted</p>
          </div>
        )}
      </div>

      {/* Texture options — only shown before upload */}
      {!value && (
        <div className='space-y-2'>
          <label className='flex cursor-pointer items-center gap-2 text-sm'>
            <input type='checkbox' checked={pixelPerfect} onChange={(e) => setPixelPerfect(e.target.checked)} />
            Pixel perfect
          </label>
          <div>
            <p className='mb-1 text-xs text-muted-foreground'>Tags (press Space to add)</p>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </div>
      )}

      {/* Uploaded info */}
      {value && (
        <p className='truncate text-xs text-muted-foreground'>{value.objectKey}</p>
      )}
    </div>
  )
}
