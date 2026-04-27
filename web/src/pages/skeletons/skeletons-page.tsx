import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DefinitionList } from '@/components/common/definition-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDefinition } from '@/api/definitions'
import type { DefinitionRecord } from '@/types/definitions'

type SkeletonRecord = DefinitionRecord

const schema = z.object({
  key: z.string().min(1, 'Key is required')
})

type FormValues = z.infer<typeof schema>

function SkeletonModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createDefinition('skeleton', { key: values.key.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['definitions'] })
      onCreated()
    }
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl border border-border bg-card shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <h2 className='text-lg font-semibold'>New Skeleton</h2>
          <button type='button' onClick={onClose} className='text-muted-foreground hover:text-foreground'>
            X
          </button>
        </div>

        <form
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
          className='space-y-4 p-6'
        >
          <div>
            <label className='mb-1 block text-sm font-medium'>Key</label>
            <Input {...form.register('key')} placeholder='e.g. human_male_base' />
            {form.formState.errors.key ? (
              <p className='mt-1 text-xs text-destructive'>{form.formState.errors.key.message}</p>
            ) : null}
          </div>

          {createMutation.isError ? (
            <p className='text-xs text-destructive'>Could not create skeleton. Try another key.</p>
          ) : null}

          <div className='flex justify-end gap-2 border-t border-border pt-4'>
            <Button type='button' variant='ghost' onClick={onClose}>Cancel</Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Skeleton'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function SkeletonsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const columns = [
    {
      header: 'Key',
      cell: (row: SkeletonRecord) => <span className='font-mono text-xs'>{row.key}</span>
    },
    {
      header: 'Created',
      cell: (row: SkeletonRecord) => <span className='text-xs text-muted-foreground'>{new Date(row.createdAt).toLocaleDateString()}</span>
    }
  ]

  return (
    <>
      <DefinitionList<SkeletonRecord>
        type='skeleton'
        title='Skeletons'
        columns={columns}
        onNew={() => setModalOpen(true)}
        newLabel='New Skeleton'
      />

      {modalOpen ? (
        <SkeletonModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['definitions'] })
          }}
        />
      ) : null}
    </>
  )
}
