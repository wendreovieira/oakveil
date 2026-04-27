import { useState, useEffect, useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, FlipHorizontal, EyeOff, Upload, ImageIcon, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DefinitionList } from '@/components/common/definition-list'
import { TagInput } from '@/components/common/tag-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/api/client'
import { getDefinitions, getDefinitionById } from '@/api/definitions'
import type { DefinitionRecord } from '@/types/definitions'
import { cn } from '@/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotRecord = DefinitionRecord & {
  payload: {
    type?: string
    compatibleUvIds?: string[]
  }
}

type SkinRecord = DefinitionRecord & {
  payload: {
    slotId?: string
    eastWestMirrored?: boolean
    northInvisible?: boolean
    tags?: string[]
  }
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const dirSchema = z.object({
  file: z.instanceof(File).nullable().optional(),
  uvId: z.string().optional(),
})

const skinSchema = z
  .object({
    key: z.string().optional(),
    tags: z.array(z.string()).default([]),
    slotId: z.string().min(1, 'Slot é obrigatório'),
    eastWestMirrored: z.boolean().default(true),
    northInvisible: z.boolean().default(false),
    south: dirSchema,
    north: dirSchema,
    east: dirSchema,
    west: dirSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.south.file) {
      ctx.addIssue({ code: 'custom', path: ['south', 'file'], message: 'Imagem obrigatória' })
    }
    if (!data.northInvisible && !data.north.file) {
      ctx.addIssue({ code: 'custom', path: ['north', 'file'], message: 'Imagem obrigatória' })
    }
    if (!data.east.file) {
      ctx.addIssue({ code: 'custom', path: ['east', 'file'], message: 'Imagem obrigatória' })
    }
    if (!data.eastWestMirrored && !data.west.file) {
      ctx.addIssue({ code: 'custom', path: ['west', 'file'], message: 'Imagem obrigatória' })
    }
  })

type SkinFormValues = z.infer<typeof skinSchema>

type Direction = 'south' | 'north' | 'east' | 'west'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateKey() {
  return `skin_${Date.now().toString(36)}`
}

const DIRECTION_LABELS: Record<Direction, string> = {
  south: 'Sul (S)',
  north: 'Norte (N)',
  east: 'Leste (L)',
  west: 'Oeste (O)',
}

// ─── Slot Search Dropdown ─────────────────────────────────────────────────────

function SlotSearchDropdown({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (id: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const query = useQuery({
    queryKey: ['definitions', { type: 'slot', page: 1, pageSize: 30, search }],
    queryFn: () => getDefinitions({ type: 'slot', page: 1, pageSize: 30, search }),
  })

  const items = query.data?.items ?? []
  const selectedLabel = value
    ? (items.find((i) => i.id === value)?.key ?? value.slice(0, 8) + '…')
    : 'Selecionar slot…'

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-sm'
      >
        <span className={value ? 'font-mono text-xs' : 'text-muted-foreground'}>{selectedLabel}</span>
        <ChevronDown className='h-4 w-4 text-muted-foreground' />
      </button>
      {open && (
        <div className='absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg'>
          <div className='p-2'>
            <Input
              autoFocus
              placeholder='Buscar slots…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='h-8 text-xs'
            />
          </div>
          <ul className='max-h-48 overflow-auto'>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type='button'
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-muted',
                    value === item.id && 'bg-secondary'
                  )}
                  onClick={() => {
                    onChange(item.id)
                    setOpen(false)
                  }}
                >
                  <span className='font-mono text-xs'>{item.key}</span>
                  {(item as SlotRecord).payload?.type && (
                    <span className='ml-2 text-xs text-muted-foreground'>
                      [{(item as SlotRecord).payload.type}]
                    </span>
                  )}
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className='px-3 py-2 text-xs text-muted-foreground'>Nenhum slot encontrado</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── UV Picker ────────────────────────────────────────────────────────────────

function UvPicker({
  slotId,
  value,
  onChange,
}: {
  slotId: string | undefined
  value: string | undefined
  onChange: (id: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const slotQuery = useQuery({
    queryKey: ['definitions', 'slot', slotId],
    queryFn: () => getDefinitionById('slot', slotId!),
    enabled: !!slotId,
  })

  const slot = slotQuery.data as SlotRecord | undefined
  const slotType = slot?.payload?.type
  const compatibleUvIds: string[] = slot?.payload?.compatibleUvIds ?? []

  const uvsQuery = useQuery({
    queryKey: ['definitions', { type: 'uv', page: 1, pageSize: 200 }],
    queryFn: () => getDefinitions({ type: 'uv', page: 1, pageSize: 200 }),
    enabled: slotType === 'Uv' && compatibleUvIds.length > 0,
  })
  const allUvs = uvsQuery.data?.items ?? []
  const uvOptions = allUvs.filter((u) => compatibleUvIds.includes(u.id))

  useEffect(() => {
    if (slotType === 'Uv' && compatibleUvIds.length === 1 && value !== compatibleUvIds[0]) {
      onChange(compatibleUvIds[0])
    }
    if (slotType !== 'Uv' || compatibleUvIds.length === 0) {
      onChange(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId, slotType, compatibleUvIds.join(',')])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!slotId || slotType !== 'Uv' || compatibleUvIds.length === 0) return null

  if (compatibleUvIds.length === 1) {
    const uvLabel = uvOptions[0]?.key ?? compatibleUvIds[0].slice(0, 8) + '…'
    return (
      <div>
        <p className='mb-1 text-xs text-muted-foreground'>UV (auto-selecionada)</p>
        <div className='flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground'>
          {uvLabel}
        </div>
      </div>
    )
  }

  const selectedLabel = value
    ? (uvOptions.find((u) => u.id === value)?.key ?? value.slice(0, 8) + '…')
    : 'Selecionar UV…'

  return (
    <div>
      <p className='mb-1 text-xs text-muted-foreground'>UV</p>
      <div ref={ref} className='relative'>
        <button
          type='button'
          onClick={() => setOpen((o) => !o)}
          className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-sm'
        >
          <span className={value ? 'font-mono text-xs' : 'text-muted-foreground'}>{selectedLabel}</span>
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        </button>
        {open && (
          <div className='absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg'>
            <ul className='max-h-48 overflow-auto'>
              {uvOptions.map((uv) => (
                <li key={uv.id}>
                  <button
                    type='button'
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-muted',
                      value === uv.id && 'bg-secondary'
                    )}
                    onClick={() => {
                      onChange(uv.id)
                      setOpen(false)
                    }}
                  >
                    <span className='font-mono text-xs'>{uv.key}</span>
                  </button>
                </li>
              ))}
              {uvOptions.length === 0 && (
                <li className='px-3 py-2 text-xs text-muted-foreground'>Nenhuma UV disponível</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Direction File Input ──────────────────────────────────────────────────────

function DirectionFileInput({
  dir,
  slotId,
  control,
  errors,
}: {
  dir: Direction
  slotId: string | undefined
  control: ReturnType<typeof useForm<SkinFormValues>>['control']
  errors: ReturnType<typeof useForm<SkinFormValues>>['formState']['errors']
}) {
  const dirErrors = errors[dir]
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='space-y-4'>
      <div>
        <p className='mb-1 text-xs text-muted-foreground'>Imagem</p>
        <Controller
          control={control}
          name={`${dir}.file`}
          render={({ field }) => {
            const file = field.value as File | null | undefined
            return (
              <div
                onClick={() => !file && inputRef.current?.click()}
                className={cn(
                  'relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition',
                  file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
              >
                <input
                  ref={inputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) field.onChange(f)
                  }}
                />

                {file ? (
                  <>
                    <p className='text-xs font-medium text-foreground'>{file.name}</p>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        field.onChange(null)
                        if (inputRef.current) inputRef.current.value = ''
                      }}
                      className='absolute right-2 top-2 rounded-full bg-destructive/10 p-1 hover:bg-destructive/20'
                    >
                      <X className='h-4 w-4 text-destructive' />
                    </button>
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                    <div className='flex items-center gap-1.5'>
                      <Upload className='h-5 w-5' />
                      <ImageIcon className='h-5 w-5' />
                    </div>
                    <p className='text-xs'>Clique ou arraste para enviar</p>
                  </div>
                )}
              </div>
            )
          }}
        />
        {dirErrors?.file && (
          <p className='mt-1 text-xs text-destructive'>{dirErrors.file.message as string}</p>
        )}
      </div>

      <Controller
        control={control}
        name={`${dir}.uvId`}
        render={({ field }) => (
          <UvPicker slotId={slotId} value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  )
}

// ─── Skin Modal ───────────────────────────────────────────────────────────────

function SkinModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const queryClient = useQueryClient()
  const [activeDir, setActiveDir] = useState<Direction>('south')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SkinFormValues>({
    resolver: zodResolver(skinSchema),
    defaultValues: {
      key: '',
      tags: [],
      slotId: '',
      eastWestMirrored: true,
      northInvisible: false,
      south: { file: null, uvId: undefined },
      north: { file: null, uvId: undefined },
      east: { file: null, uvId: undefined },
      west: { file: null, uvId: undefined },
    },
  })

  const slotId = useWatch({ control, name: 'slotId' })
  const eastWestMirrored = useWatch({ control, name: 'eastWestMirrored' })
  const northInvisible = useWatch({ control, name: 'northInvisible' })

  useEffect(() => {
    if (activeDir === 'north' && northInvisible) setActiveDir('south')
    if (activeDir === 'west' && eastWestMirrored) setActiveDir('east')
  }, [northInvisible, eastWestMirrored, activeDir])

  const createMutation = useMutation({
    mutationFn: async (data: SkinFormValues) => {
      const formData = new FormData()
      formData.append('key', data.key?.trim() || generateKey())
      formData.append('slotId', data.slotId)
      formData.append('eastWestMirrored', String(data.eastWestMirrored))
      formData.append('northInvisible', String(data.northInvisible))
      formData.append('tags', JSON.stringify(data.tags))

      if (data.south.file) {
        formData.append('south', data.south.file)
        if (data.south.uvId) formData.append('southUvId', data.south.uvId)
      }
      if (!data.northInvisible && data.north.file) {
        formData.append('north', data.north.file)
        if (data.north.uvId) formData.append('northUvId', data.north.uvId)
      }
      if (data.east.file) {
        formData.append('east', data.east.file)
        if (data.east.uvId) formData.append('eastUvId', data.east.uvId)
      }
      if (!data.eastWestMirrored && data.west.file) {
        formData.append('west', data.west.file)
        if (data.west.uvId) formData.append('westUvId', data.west.uvId)
      }

      const result = await apiClient.post('/api/definitions/skin/with-images', formData, {
        headers: { 'Content-Type': undefined },
      })
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions'] })
      onCreated()
      onClose()
    },
  })

  const dirs: Direction[] = ['south', 'north', 'east', 'west']
  const visibleDirs = dirs.filter((d) => {
    if (d === 'north' && northInvisible) return false
    if (d === 'west' && eastWestMirrored) return false
    return true
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div
        className='flex w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-xl'
        style={{ maxHeight: '90vh' }}
      >
        <div className='shrink-0 border-b border-border px-6 py-4'>
          <h2 className='text-base font-semibold'>Nova Skin</h2>
          <p className='text-xs text-muted-foreground'>Registrar uma nova definição de skin</p>
        </div>

        <form
          onSubmit={handleSubmit((data) => createMutation.mutate(data))}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex-1 overflow-y-auto px-6 py-5'>
            <div className='space-y-5'>
              <div>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Key{' '}
                  <span className='text-muted-foreground/60'>(opcional — gerada automaticamente)</span>
                </p>
                <Input
                  {...register('key')}
                  placeholder='ex: skin_hero_default'
                  className='font-mono text-sm'
                />
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Tags</p>
                <Controller
                  control={control}
                  name='tags'
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div>
                <p className='mb-1 text-xs text-muted-foreground'>Slot</p>
                <Controller
                  control={control}
                  name='slotId'
                  render={({ field }) => (
                    <SlotSearchDropdown
                      value={field.value || undefined}
                      onChange={(id) => {
                        field.onChange(id ?? '')
                        setValue('south.uvId', undefined)
                        setValue('north.uvId', undefined)
                        setValue('east.uvId', undefined)
                        setValue('west.uvId', undefined)
                      }}
                    />
                  )}
                />
                {errors.slotId && (
                  <p className='mt-1 text-xs text-destructive'>{errors.slotId.message}</p>
                )}
              </div>

              <div className='rounded-lg border border-border bg-muted/20 p-4'>
                <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Opções de direção
                </p>
                <div className='space-y-2.5'>
                  <Controller
                    control={control}
                    name='eastWestMirrored'
                    render={({ field }) => (
                      <label className='flex cursor-pointer items-center gap-3 text-sm'>
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className='h-4 w-4'
                        />
                        <FlipHorizontal className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span>
                          Leste e Oeste são a mesma textura{' '}
                          <span className='text-muted-foreground'>(espelhado)</span>
                        </span>
                      </label>
                    )}
                  />
                  <Controller
                    control={control}
                    name='northInvisible'
                    render={({ field }) => (
                      <label className='flex cursor-pointer items-center gap-3 text-sm'>
                        <input
                          type='checkbox'
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className='h-4 w-4'
                        />
                        <EyeOff className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span>
                          Norte é invisível{' '}
                          <span className='text-muted-foreground'>(sem textura)</span>
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>

              <div>
                <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Texturas por direção
                </p>

                <div className='mb-4 flex gap-1 rounded-lg border border-border bg-muted/20 p-1'>
                  {dirs.map((d) => {
                    const isHidden =
                      (d === 'north' && northInvisible) || (d === 'west' && eastWestMirrored)
                    const hasError = !isHidden && !!errors[d]?.file
                    return (
                      <button
                        key={d}
                        type='button'
                        disabled={isHidden}
                        onClick={() => setActiveDir(d)}
                        className={cn(
                          'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition',
                          activeDir === d && !isHidden
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                          isHidden && 'cursor-not-allowed opacity-30',
                          hasError && 'text-destructive'
                        )}
                      >
                        {DIRECTION_LABELS[d]}
                      </button>
                    )
                  })}
                </div>

                {visibleDirs.includes(activeDir) && (
                  <DirectionFileInput
                    key={activeDir}
                    dir={activeDir}
                    slotId={slotId || undefined}
                    control={control}
                    errors={errors}
                  />
                )}

                {eastWestMirrored && (
                  <p className='mt-3 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <FlipHorizontal className='h-3.5 w-3.5' />
                    Oeste usará a textura de Leste espelhada automaticamente.
                  </p>
                )}
                {northInvisible && (
                  <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <EyeOff className='h-3.5 w-3.5' />
                    Norte será invisível — nenhuma textura necessária.
                  </p>
                )}

                {visibleDirs.some((d) => errors[d]?.file) && (
                  <p className='mt-2 text-xs text-destructive'>
                    Direções sem textura:{' '}
                    {visibleDirs
                      .filter((d) => errors[d]?.file)
                      .map((d) => DIRECTION_LABELS[d])
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='shrink-0 flex justify-end gap-2 border-t border-border px-6 py-4'>
            <Button type='button' variant='ghost' onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando…' : 'Criar Skin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Skins Page ───────────────────────────────────────────────────────────────

export function SkinsPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const columns = [
    {
      header: 'Key',
      cell: (row: SkinRecord) => <span className='font-mono text-xs'>{row.key}</span>,
    },
    {
      header: 'Slot',
      cell: (row: SkinRecord) => (
        <span className='font-mono text-xs text-muted-foreground'>
          {row.payload?.slotId ? row.payload.slotId.slice(0, 8) + '…' : '—'}
        </span>
      ),
    },
    {
      header: 'Direções',
      cell: (row: SkinRecord) => (
        <div className='flex gap-1 text-xs'>
          <span className='rounded bg-secondary px-1.5 py-0.5'>S</span>
          {!row.payload?.northInvisible && (
            <span className='rounded bg-secondary px-1.5 py-0.5'>N</span>
          )}
          <span className='rounded bg-secondary px-1.5 py-0.5'>L</span>
          {!row.payload?.eastWestMirrored ? (
            <span className='rounded bg-secondary px-1.5 py-0.5'>O</span>
          ) : (
            <span className='rounded bg-muted px-1.5 py-0.5 text-muted-foreground'>O↔</span>
          )}
        </div>
      ),
    },
    {
      header: 'Tags',
      cell: (row: SkinRecord) => {
        const tags = row.payload?.tags ?? []
        if (tags.length === 0)
          return <span className='text-xs text-muted-foreground'>—</span>
        return (
          <div className='flex flex-wrap gap-1'>
            {tags.map((tag) => (
              <span
                key={tag}
                className='rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'
              >
                {tag}
              </span>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <div className='p-8'>
      <DefinitionList<SkinRecord>
        definitionType='skin'
        title='Skins'
        description='Gerenciar definições de skins'
        columns={columns}
        newLabel='Nova Skin'
        onNew={() => setShowModal(true)}
      />

      {showModal && (
        <SkinModal
          onClose={() => setShowModal(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['definitions'] })}
        />
      )}
    </div>
  )
}
