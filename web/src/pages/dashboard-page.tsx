import { Link } from 'react-router-dom'
import { Boxes, FileText, Image, Workflow, Sword, Waypoints } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'

const cards = [
  { icon: FileText, title: 'Definitions CRUD', to: '/definitions/texture', desc: 'Manage all definition entities via reusable pages.' },
  { icon: Image, title: 'Texture Editor', to: '/editors/texture', desc: 'Upload and configure sprite sheets and tags.' },
  { icon: Boxes, title: 'UV / Variant Editors', to: '/editors/uv', desc: 'Create UV regions and pixel arrangement variants.' },
  { icon: Sword, title: 'Rig Animation', to: '/editors/riganimation', desc: 'Edit slot tracks and keyframes on a timeline.' },
  { icon: Workflow, title: 'Character Rig/Skin', to: '/editors/characterrig', desc: 'Set slot hierarchy and skin assignments.' },
  { icon: Waypoints, title: 'Quest/Interaction Graph', to: '/editors/graph', desc: 'Graph editor powered by React Flow.' }
]

export function DashboardPage() {
  return (
    <div>
      <PageHeader title='Oakveil Toolchain' description='Visual-first admin/editor frontend for game content operations.' badge='Desktop-first' />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {cards.map((item) => (
          <Link key={item.title} to={item.to}>
            <Card className='h-full transition hover:-translate-y-1 hover:border-primary/50'>
              <CardHeader>
                <div className='mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted'>
                  <item.icon className='h-5 w-5' />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-xs uppercase tracking-wide text-primary'>Open editor</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
