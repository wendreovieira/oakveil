import { Badge } from '@/components/ui/badge'

export function PageHeader({
  title,
  description,
  badge
}: {
  title: string
  description?: string
  badge?: string
}) {
  return (
    <div className='mb-6 flex flex-col gap-2'>
      <div className='flex items-center gap-3'>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        {badge ? <Badge>{badge}</Badge> : null}
      </div>
      {description ? <p className='max-w-3xl text-sm text-muted-foreground'>{description}</p> : null}
    </div>
  )
}
