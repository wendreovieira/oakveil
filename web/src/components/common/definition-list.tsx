import { useState, useMemo, type ReactNode } from 'react'
import { Search, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useDefinitionsQuery, useDefinitionMutations } from '@/features/definitions/queries'
import type { DefinitionType, DefinitionRecord } from '@/types/definitions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export type ColumnDef<T> = {
  header: string
  cell: (row: T) => ReactNode
  width?: string
}

type Props<T extends DefinitionRecord> = {
  type: DefinitionType
  title: string
  columns?: ColumnDef<T>[]
  onNew?: () => void
  newLabel?: string
  extraActions?: (row: T) => ReactNode
}

export function DefinitionList<T extends DefinitionRecord>({
  type,
  title,
  columns,
  onNew,
  newLabel = 'New',
  extraActions
}: Props<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const PAGE_SIZE = 20

  const query = useDefinitionsQuery({ type, page, pageSize: PAGE_SIZE, search, includeDeleted })
  const { deleteMutation } = useDefinitionMutations(type)

  const totalPages = useMemo(() => {
    const total = query.data?.totalCount ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [query.data?.totalCount])

  const rows = (query.data?.items ?? []) as T[]

  const defaultColumns: ColumnDef<T>[] = [
    { header: 'Key', cell: (r) => <span className='font-mono text-xs'>{r.key}</span> },
    {
      header: 'Created',
      cell: (r) => <span className='text-xs text-muted-foreground'>{new Date(r.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Status',
      cell: (r) => r.isDeleted
        ? <Badge className='border-muted bg-muted text-muted-foreground'>Deleted</Badge>
        : <Badge>Active</Badge>
    }
  ]

  const cols = columns ?? defaultColumns

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        {onNew && (
          <Button onClick={onNew} className='gap-2'>
            <Plus className='h-4 w-4' />
            {newLabel}
          </Button>
        )}
      </div>

      <Card className='mb-4'>
        <CardContent className='pt-5'>
          <div className='flex flex-wrap gap-3'>
            <div className='relative min-w-[220px] flex-1'>
              <Search className='pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                className='pl-9'
                placeholder='Search…'
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <label className='flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm'>
              <input
                type='checkbox'
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Include deleted
            </label>
            <Button variant='outline' size='sm' onClick={() => query.refetch()} className='gap-1'>
              <RefreshCw className='h-3.5 w-3.5' />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='pt-5'>
          {query.isLoading ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>Loading…</p>
          ) : rows.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>No records found.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  {cols.map((c) => (
                    <TH key={c.header} style={c.width ? { width: c.width } : undefined}>{c.header}</TH>
                  ))}
                  <TH style={{ width: '80px' }} />
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    {cols.map((c) => (
                      <TD key={c.header}>{c.cell(row)}</TD>
                    ))}
                    <TD>
                      <div className='flex items-center gap-1 justify-end'>
                        {extraActions?.(row)}
                        <button
                          title='Delete'
                          onClick={() => deleteMutation.mutate(row.id)}
                          className='rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                Page {page} of {totalPages} · {query.data?.totalCount ?? 0} total
              </span>
              <div className='flex gap-2'>
                <Button size='sm' variant='outline' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size='sm' variant='outline' disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
