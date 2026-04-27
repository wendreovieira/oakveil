import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'

export function QuestEditorPage() {
  return (
    <div>
      <PageHeader title='Quest Editor' description='Domain-focused quest objective/reward management screen.' />
      <Card>
        <CardContent className='pt-5'>
          <p className='text-sm text-muted-foreground'>Use the Definitions CRUD for now and the Graph Editor for branching flow modeling. This page is reserved for richer quest-specific forms.</p>
        </CardContent>
      </Card>
    </div>
  )
}
