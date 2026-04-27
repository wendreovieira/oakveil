import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Swords, Waypoints, Image, Boxes, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { definitionTypes } from '@/types/definitions'
import { CommandPalette } from '@/components/common/command-palette'

const menu = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Image, label: 'Texture Editor', to: '/editors/texture' },
  { icon: Boxes, label: 'UV Editor', to: '/editors/uv' },
  { icon: Boxes, label: 'UV Variant Editor', to: '/editors/uvvariant' },
  { icon: Swords, label: 'Rig Animation', to: '/editors/riganimation' },
  { icon: Waypoints, label: 'Graph Editor', to: '/editors/graph' },
  { icon: ClipboardList, label: 'Quest Editor', to: '/editors/quest' }
]

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const email = useAuthStore((state) => state.email)

  return (
    <div className='flex min-h-screen'>
      <aside className='w-72 border-r border-border/80 bg-card/70 p-4 backdrop-blur'>
        <Link to='/' className='mb-6 block rounded-md border border-border bg-muted/40 p-3'>
          <div className='text-xs uppercase tracking-widest text-muted-foreground'>Oakveil</div>
          <div className='text-lg font-semibold'>Admin + Visual Editor</div>
        </Link>

        <nav className='space-y-1'>
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
              }
            >
              <item.icon className='h-4 w-4' />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='mt-6 rounded-md border border-border p-3'>
          <div className='mb-2 text-xs uppercase tracking-widest text-muted-foreground'>Definitions</div>
          <div className='max-h-64 space-y-1 overflow-auto pr-1'>
            {definitionTypes.map((type) => (
              <NavLink
                key={type}
                to={`/definitions/${type}`}
                className={({ isActive }) =>
                  `block rounded px-2 py-1 text-xs uppercase tracking-wide ${isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'}`
                }
              >
                {type}
              </NavLink>
            ))}
          </div>
        </div>

        <div className='mt-auto pt-6'>
          <div className='mb-2 text-xs text-muted-foreground'>Logged as {email ?? 'unknown'}</div>
          <button
            className='flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted'
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut className='h-4 w-4' />
            Logout
          </button>
        </div>
      </aside>

      <main className='flex-1 overflow-auto p-6 lg:p-8'>
        <Outlet />
      </main>

      <CommandPalette />
    </div>
  )
}
