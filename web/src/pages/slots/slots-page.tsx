import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DefinitionList } from '@/components/common/definition-list'
import { TextureUpload, type TextureResult } from '@/components/common/texture-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDefinition, getDefinitions } from '@/api/definitions'
import type { DefinitionRecord } from '@/types/definitions'
import { cn } from '@/utils/cn'

type SlotRecord = DefinitionRecord & {
  payload: {
    skeletonId?: string
    type: string
    parentSlotId?: string
    localPosition?: { x: number; y: number }
    mirrorMode?: string
    animationMirrorMode?: string
    zIndex?: number
    compatibleUvIds?: string[]
  }
}

const uvSchema = z.object({
  texture: z.custom<TextureResult | null>(
    (v) => v !== null && v !== undefined,
    'Texture is required'
  )
})
type UvFormValues = z.infer<typeof uvSchema>

const slotSchema = z.object({
  key: z.string().optional(),
  skeletonId: z.string().min(1, 'Skeleton is required'),
  type: z.enum(['Uv', 'PixelTransform', 'Transform']),
  parentSlotId: z.string().optional(),
  localPositionX: z.number().default(0),
  localPositionY: z.number().default(0),
  mirrorMode: z.enum(['None', 'MirrorPosition', 'FlipTexture', 'MirrorAndFlip']).default('None'),
  animationMirrorMode: z.enum(['None', 'Synchronized', 'ReverseFrame', 'OppositePhase']).default('None'),
  zIndex: z.number().int().default(0),
  isPaintable: z.boolean().default(false),
  compatibleUvIds: z.array(z.object({ uvId: z.string() })).default([])
})
type SlotFormValues = z.infer<typeof slotSchema>

function generateKey() {
  return `slot_${Date.now().toString(36)}`
}

function DefinitionSearchDropdown({
  definitionType,
  value,
  onChange,
  searchPlaceholder,
  emptyLabel,
  allowNone = true
}: {
  definitionType: 'slot' | 'skeleton'
  value: string | undefined
  onChange: (id: string | undefined) => void
  searchPlaceholder: string
  emptyLabel: string
  allowNone?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const query = useQuery({
    queryKey: ['definitions', { type: definitionType, page: 1, pageSize: 30, search }],
    queryFn: () => getDefinitions({ type: definitionType, page: 1, pageSize: 30, search })
  })

  const items = query.data?.items ?? []
  const selectedLabel = value ? (items.find((i) => i.id === value)?.key ?? value.slice(0, 8)) : emptyLabel

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
        {selectedLabel}
        <ChevronDown className='h-4 w-4 text-muted-foreground' />
      </button>
      {open && (
        <div className='absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg'>
          <div className='p-2'>
            <Input autoFocus placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className='h-8 text-xs' />
          </div>
          <ul className='max-h-48 overflow-auto'>
            {allowNone && (
              <li>
                <button type='button' className='w-full px-3 py-2 text-left text-sm hover:bg-muted' onClick={() => { onChange(undefined); setOpen(false) }}>
                  <span className='text-muted-foreground'>{emptyLabel}</span>
                </button>
              </li>
            )}
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type='button'
                  className={cn('w-full px-3 py-2 text-left text-sm hover:bg-muted', value === item.id && 'bg-secondary')}
                  onClick={() => { onChange(item.id); setOpen(false) }}
                >
                  <span className='font-mono text-xs'>{item.key}</span>
                </button>
              </li>
            ))}
            {items.length === 0 && <li className='px-3 py-2 text-xs text-muted-foreground'>No records found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function InlineUvPanel({ uvIds, onAdd, onRemove }: { uvIds: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void }) {
  const [creating, setCreating] = useState(false)
  const queryClient = useQueryClient()

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UvFormValues>({
    resolver: zodResolver(uvSchema),
    defaultValues: { texture: null }
  })

  const createUvMutation = useMutation({
    mutationFn: async (data: UvFormValues) => createDefinition('uv', { textureId: data.texture!.textureId }),
    onSuccess: (def) => {
      onAdd(def.id)
      reset()
      setCreating(false)
      queryClient.invalidateQueries({ queryKey: ['definitions'] })
    }
  })

  return (
    <div className='rounded-lg border border-border p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium'>Compatible UVs ({uvIds.length})</span>
        <Button type='button' size='sm' variant='outline' className='gap-1' onClick={() => setCreating((v) => !v)}>
          <Plus className='h-3.5 w-3.5' /> Add UV
        </Button>
      </div>
      {uvIds.length > 0 && (
        <ul className='mb-3 space-y-1'>
          {uvIds.map((id) => (
            <li key={id} className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5'>
              <span className='font-mono text-xs'>{id}</span>
              <button type='button' onClick={() => onRemove(id)} className='rounded p-0.5 hover:text-destructive'>
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            </li>
          ))}
        </ul>
      )}
      {creating && (
        <form onSubmit={handleSubmit((data) => createUvMutation.mutate(data))} className='rounded-lg border border-dashed border-primary/40 bg-muted/20 p-4'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>New UV</p>
          <div className='mb-3'>
            <p className='mb-1 text-xs text-muted-foreground'>Texture (will be auto-created)</p>
            <Controller
              control={control}
              name='texture'
              render={({ field }) => (
                <TextureUpload value={field.value as TextureResult | null} onChange={field.onChange} folder='textures' />
              )}
            />
            {errors.texture && <p className='mt-1 text-xs text-destructive'>{errors.texture.message as string}</p>}
          </div>
          <div className='flex justify-end gap-2'>
            <Button type='button' size='sm' variant='ghost' onClick={() => { setCreating(false); reset() }}>Cancel</Button>
            <Button type='submit' size='sm' disabled={createUvMutation.isPending}>
              {createUvMutation.isPending ? 'Creating…' : 'Create UV'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function SlotModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const queryClient = useQueryClient()

  const { register, control, handleSubmit, formState: { errors } } = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: { skeletonId: '', type: 'Uv', localPositionX: 0, localPositionY: 0, mirrorMode: 'None', animationMirrorMode: 'None', zIndex: 0, isPaintable: false, compatibleUvIds: [] }
  })

  const { fields: uvFields, append: appendUv, remove: removeUv } = useFieldArray({ control, name: 'compatibleUvIds' })

  const createMutation = useMutation({
    mutationFn: (values: SlotFormValues) =>
      createDefinition('slot', {
        key: values.key?.trim() || generateKey(),
        skeletonId: values.skeletonId,
        type: values.type,
        parentSlotId: values.parentSlotId || null,
        localPosition: { x: values.localPositionX, y: values.localPositionY },
        mirrorMode: values.mirrorMode,
        animationMirrorMode: values.animationMirrorMode,
        zIndex: values.zIndex,
        isPaintable: values.isPaintable,
        compatibleUvIds: uvFields.map((f) => f.uvId)
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['definitions'] }); onCreated() }
  })

  const slotTypes: SlotFormValues['type'][] = ['Uv', 'PixelTransform', 'Transform']
  const mirrorModes: SlotFormValues['mirrorMode'][] = ['None', 'MirrorPosition', 'FlipTexture', 'MirrorAndFlip']
  const animMirrors: SlotFormValues['animationMirrorMode'][] = ['None', 'Synchronized', 'ReverseFrame', 'OppositePhase']

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <h2 className='text-lg font-semibold'>New Slot</h2>
          <button type='button' onClick={onClose} className='text-muted-foreground hover:text-foreground'>✕</button>
        </div>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className='space-y-5 p-6'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Key <span className='text-xs font-normal text-muted-foreground'>(optional)</span></label>
            <Input {...register('key')} placeholder='e.g. slot_head' />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Skeleton</label>
            <Controller control={control} name='skeletonId' render={({ field }) => (
              <DefinitionSearchDropdown
                definitionType='skeleton'
                value={field.value || undefined}
                onChange={(id) => field.onChange(id ?? '')}
                searchPlaceholder='Search skeletons…'
                emptyLabel='Select skeleton'
                allowNone={false}
              />
            )} />
            {errors.skeletonId && <p className='mt-1 text-xs text-destructive'>{errors.skeletonId.message}</p>}
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Type</label>
            <Controller control={control} name='type' render={({ field }) => (
              <select value={field.value} onChange={(e) => field.onChange(e.target.value as SlotFormValues['type'])} className='h-10 w-full rounded-md border border-input bg-card px-3 text-sm'>
                {slotTypes.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )} />
            {errors.type && <p className='mt-1 text-xs text-destructive'>{errors.type.message}</p>}
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Parent Slot</label>
            <Controller control={control} name='parentSlotId' render={({ field }) => (
              <DefinitionSearchDropdown
                definitionType='slot'
                value={field.value}
                onChange={field.onChange}
                searchPlaceholder='Search slots…'
                emptyLabel='None'
              />
            )} />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium'>Local Position</label>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1 block text-xs text-muted-foreground'>X</label>
                <Input type='number' step='any' {...register('localPositionX', { valueAsNumber: true })} />
              </div>
              <div>
                <label className='mb-1 block text-xs text-muted-foreground'>Y</label>
                <Input type='number' step='any' {...register('localPositionY', { valueAsNumber: true })} />
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1 block text-sm font-medium'>Mirror Mode</label>
              <Controller control={control} name='mirrorMode' render={({ field }) => (
                <select value={field.value} onChange={(e) => field.onChange(e.target.value)} className='h-10 w-full rounded-md border border-input bg-card px-3 text-sm'>
                  {mirrorModes.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )} />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium'>Anim Mirror Mode</label>
              <Controller control={control} name='animationMirrorMode' render={({ field }) => (
                <select value={field.value} onChange={(e) => field.onChange(e.target.value)} className='h-10 w-full rounded-md border border-input bg-card px-3 text-sm'>
                  {animMirrors.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )} />
            </div>
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Z-Index</label>
            <Input type='number' {...register('zIndex', { valueAsNumber: true })} />
          </div>
          <div>
            <Controller control={control} name='isPaintable' render={({ field }) => (
              <label className='flex cursor-pointer items-center gap-2 text-sm'>
                <input type='checkbox' checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className='h-4 w-4' />
                <span>Paintable <span className='text-muted-foreground'>(pode ser pintado em runtime)</span></span>
              </label>
            )} />
          </div>
          <InlineUvPanel
            uvIds={uvFields.map((f) => f.uvId)}
            onAdd={(id) => appendUv({ uvId: id })}
            onRemove={(id) => { const idx = uvFields.findIndex((f) => f.uvId === id); if (idx !== -1) removeUv(idx) }}
          />
          <div className='flex justify-end gap-3 border-t border-border pt-4'>
            <Button type='button' variant='ghost' onClick={onClose}>Cancel</Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Slot'}
            </Button>
          </div>
          {createMutation.isError && <p className='text-xs text-destructive'>Failed to create slot. Please try again.</p>}
        </form>
      </div>
    </div>
  )
}

export function SlotsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const columns = [
    { header: 'Key', cell: (row: SlotRecord) => <span className='font-mono text-xs'>{row.key}</span> },
    { header: 'Skeleton', cell: (row: SlotRecord) => <span className='font-mono text-xs'>{row.payload?.skeletonId ?? '—'}</span> },
    { header: 'Type', cell: (row: SlotRecord) => <span className='rounded-md bg-secondary px-2 py-0.5 text-xs font-medium'>{row.payload?.type ?? '—'}</span> },
    { header: 'Z-Index', cell: (row: SlotRecord) => <span className='text-xs text-muted-foreground'>{row.payload?.zIndex ?? 0}</span> },
    { header: 'UVs', cell: (row: SlotRecord) => <span className='text-xs text-muted-foreground'>{row.payload?.compatibleUvIds?.length ?? 0}</span> },
    { header: 'Created', cell: (row: SlotRecord) => <span className='text-xs text-muted-foreground'>{new Date(row.createdAt).toLocaleDateString()}</span> }
  ]

  return (
    <>
      <DefinitionList<SlotRecord>
        type='slot'
        title='Slots'
        columns={columns}
        newLabel='New Slot'
        onNew={() => setModalOpen(true)}
      />
      {modalOpen && (
        <SlotModal
          onClose={() => setModalOpen(false)}
          onCreated={() => { setModalOpen(false); queryClient.invalidateQueries({ queryKey: ['definitions'] }) }}
        />
      )}
    </>
  )
}
