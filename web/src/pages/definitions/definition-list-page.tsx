import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { definitionTypes, type DefinitionType } from '@/types/definitions'
import { useDefinitionsQuery, useDefinitionMutations } from '@/features/definitions/queries'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

function parseType(raw: string | undefined): DefinitionType {
  if (!raw || !definitionTypes.includes(raw as DefinitionType)) {
    return 'texture'
  }

  return raw as DefinitionType
}

export function DefinitionListPage() {
  const params = useParams()
  const definitionType = parseType(params.definitionType)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const query = useDefinitionsQuery({
    type: definitionType,
    page,
    pageSize: 20,
    search,
    includeDeleted
  })

  const { deleteMutation } = useDefinitionMutations(definitionType)

  const totalPages = useMemo(() => {
    const total = query.data?.totalCount ?? 0
    return Math.max(1, Math.ceil(total / 20))
  }, [query.data?.totalCount])

  return (
    <div>
      <PageHeader title={`${definitionType} definitions`} description='Generic CRUD layer with search, pagination and soft delete visibility.' />

      <Card className='mb-4'>
        <CardContent className='pt-5'>
          <div className='grid gap-3 md:grid-cols-[1fr_auto_auto_auto]'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                className='pl-9'
                placeholder='Search by key or payload...'
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
            </div>

            <label className='flex items-center gap-2 rounded-md border border-border px-3 text-sm'>
              <input type='checkbox' checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)} />
              Include deleted
            </label>

            <Link to={`/definitions/${definitionType}/new`}>
              <Button>Create</Button>
            </Link>

            <Button variant='secondary' onClick={() => query.refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='pt-5'>
          <div className='overflow-x-auto'>
            <Table>
              <THead>
                <TR>
                  <TH>Key</TH>
                  <TH>Updated</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {(query.data?.items ?? []).map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <div className='font-medium'>{item.key}</div>
                      <div className='text-xs text-muted-foreground'>{item.id}</div>
                    </TD>
                    <TD>{new Date(item.updatedAt).toLocaleString()}</TD>
                    <TD>{item.isDeleted ? <Badge className='bg-destructive text-destructive-foreground'>Deleted</Badge> : <Badge>Active</Badge>}</TD>
                    <TD>
                      <div className='flex gap-2'>
                        <Link to={`/definitions/${definitionType}/${item.id}`}>
                          <Button size='sm' variant='outline'>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size='sm'
                          variant='destructive'
                          disabled={item.isDeleted || deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <div className='mt-4 flex items-center justify-between text-sm'>
            <span>
              Page {page} / {totalPages} - total {query.data?.totalCount ?? 0}
            </span>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
                Prev
              </Button>
              <Button variant='outline' size='sm' disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
