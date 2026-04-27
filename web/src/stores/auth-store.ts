import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  email: string | null
  roles: string[]
  setSession: (token: string, email: string, roles: string[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      roles: [],
      setSession: (token, email, roles) => set({ token, email, roles }),
      logout: () => set({ token: null, email: null, roles: [] })
    }),
    {
      name: 'oakveil-auth'
    }
  )
)
