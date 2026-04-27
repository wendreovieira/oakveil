import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Users,
  Swords,
  TreePine,
  House,
  Box,
  Route,
  Bone,
  Layers,
  Play,
  Shirt,
  ScrollText,
  Globe,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { CommandPalette } from '@/components/common/command-palette'

type NavItem = {
  icon: LucideIcon
  label: string
  to: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Characters',
    items: [
      { icon: Users, label: 'NPCs', to: '/definitions/npc' },
      { icon: Swords, label: 'Enemies', to: '/definitions/enemy' },
    ],
  },
  {
    label: 'World',
    items: [
      { icon: TreePine, label: 'Biomes', to: '/definitions/biome' },
      { icon: House, label: 'Houses', to: '/definitions/house' },
      { icon: Box, label: 'Objects', to: '/definitions/object' },
      { icon: Route, label: 'Roads', to: '/definitions/road' },
    ],
  },
  {
    label: 'Rigging',
    items: [
      { icon: Bone, label: 'Skeletons', to: '/definitions/skeleton' },
      { icon: Layers, label: 'Slots', to: '/slots' },
      { icon: Shirt, label: 'Skins', to: '/definitions/skin' },
      { icon: Play, label: 'Animations', to: '/definitions/animation' },
    ],
  },
  {
    label: 'Other',
    items: [
      { icon: ScrollText, label: 'Quests', to: '/editors/quest' },
      { icon: Globe, label: 'Languages', to: '/definitions/language' },
      { icon: Volume2, label: 'Sounds', to: '/definitions/sound' },
    ],
  },
]

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const email = useAuthStore((state) => state.email)

  return (
    <div className='flex min-h-screen'>
      <aside className='flex w-64 flex-col border-r border-border/80 bg-card/70 backdrop-blur'>
        <div className='p-4'>
          <Link to='/' className='mb-6 block rounded-md border border-border bg-muted/40 p-3'>
            <div className='text-xs uppercase tracking-widest text-muted-foreground'>Oakveil</div>
            <div className='text-lg font-semibold'>Admin Panel</div>
          </Link>

          <nav className='space-y-0.5'>
            <NavLink
              to='/'
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
              }
            >
              <LayoutDashboard className='h-4 w-4' />
              Dashboard
            </NavLink>
          </nav>

          {navGroups.map((group) => (
            <div key={group.label} className='mt-5'>
              <div className='mb-1 px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground'>
                {group.label}
              </div>
              <nav className='space-y-0.5'>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
                    }
                  >
                    <item.icon className='h-4 w-4 shrink-0' />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className='mt-auto border-t border-border/80 p-4'>
          <div className='mb-2 truncate text-xs text-muted-foreground'>Logged as {email ?? 'unknown'}</div>
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
