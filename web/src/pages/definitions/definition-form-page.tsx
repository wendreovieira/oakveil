import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { definitionTypes, type DefinitionType } from '@/types/definitions'
import { useDefinitionByIdQuery, useDefinitionMutations } from '@/features/definitions/queries'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  key: z.string().min(1, 'Key is required'),
  payloadJson: z.string().min(2, 'Payload JSON is required')
})

type FormValues = z.infer<typeof schema>

function parseType(raw: string | undefined): DefinitionType {
  if (!raw || !definitionTypes.includes(raw as DefinitionType)) {
    return 'texture'
  }

  return raw as DefinitionType
}

export function DefinitionFormPage() {
  const params = useParams()
  const navigate = useNavigate()

  const definitionType = parseType(params.definitionType)
  const definitionId = params.definitionId
  const isCreate = definitionId === 'new'

  const query = useDefinitionByIdQuery(definitionType, definitionId ?? '', true)
  const { createMutation, updateMutation } = useDefinitionMutations(definitionType)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: '',
      payloadJson: '{\n  "Key": ""\n}'
    }
  })

  useEffect(() => {
    if (query.data && !isCreate) {
      form.reset({
        key: query.data.key,
        payloadJson: JSON.stringify(query.data.payload, null, 2)
      })
    }
  }, [query.data, isCreate, form])

  return (
    <div>
      <PageHeader title={isCreate ? `Create ${definitionType}` : `Edit ${definitionType}`} description='Generic dynamic JSON form for any definition type.' />

      <Card>
        <CardContent className='pt-5'>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const parsed = JSON.parse(values.payloadJson) as Record<string, unknown>
                parsed.Key = values.key

                if (isCreate) {
                  const created = await createMutation.mutateAsync(parsed)
                  toast.success('Definition created')
                  navigate(`/definitions/${definitionType}/${created.id}`)
                  return
                }

                await updateMutation.mutateAsync({ id: definitionId!, payload: parsed })
                toast.success('Definition updated')
              } catch (error) {
                toast.error('Invalid JSON payload or server validation failed')
              }
            })}
          >
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Key</label>
              <Input {...form.register('key')} />
              {form.formState.errors.key ? <p className='text-xs text-destructive'>{form.formState.errors.key.message}</p> : null}
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Payload JSON</label>
              <Textarea rows={16} className='font-mono text-xs' {...form.register('payloadJson')} />
              {form.formState.errors.payloadJson ? <p className='text-xs text-destructive'>{form.formState.errors.payloadJson.message}</p> : null}
            </div>

            <div className='flex gap-2'>
              <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
                {isCreate ? 'Create' : 'Save'}
              </Button>
              <Link to={`/definitions/${definitionType}`}>
                <Button type='button' variant='outline'>
                  Back
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
