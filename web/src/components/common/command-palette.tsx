import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const links = [
  { label: 'Dashboard', path: '/' },
  { label: 'Definitions', path: '/definitions/texture' },
  { label: 'Texture Editor', path: '/editors/texture' },
  { label: 'UV Editor', path: '/editors/uv' },
  { label: 'UV Variant Editor', path: '/editors/uvvariant' },
  { label: 'Character Rig Editor', path: '/editors/characterrig' },
  { label: 'Character Skin Editor', path: '/editors/characterskin' },
  { label: 'Rig Animation Editor', path: '/editors/riganimation' },
  { label: 'Quest/Interaction Graph', path: '/editors/graph' }
]

export function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }

      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const results = useMemo(() => {
    const text = query.toLowerCase().trim()
    return links.filter((item) => item.label.toLowerCase().includes(text))
  }, [query])

  if (!open) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20' onClick={() => setOpen(false)}>
      <Card className='w-full max-w-xl p-4' onClick={(event) => event.stopPropagation()}>
        <div className='relative mb-3'>
          <Search className='pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input className='pl-9' value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search command or page...' />
        </div>
        <div className='space-y-1'>
          {results.map((item) => (
            <button
              key={item.path}
              className='w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted'
              onClick={() => {
                navigate(item.path)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
