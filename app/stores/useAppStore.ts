import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  themeMode: 'light' | 'dark' | 'system'
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        themeMode: 'system',
        setThemeMode: (mode) => set({ themeMode: mode }, false, 'setThemeMode')
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ sidebarOpen: state.sidebarOpen, themeMode: state.themeMode })
      }
    ),
    { name: 'AppStore' }
  )
)
