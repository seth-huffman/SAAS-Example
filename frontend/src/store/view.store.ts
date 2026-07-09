import { create } from 'zustand';

type ViewMode = 'manager' | 'employee';

interface ViewStore {
  viewMode: ViewMode;
  toggle: () => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  viewMode: 'employee',
  toggle: () => set((s) => ({ viewMode: s.viewMode === 'manager' ? 'employee' : 'manager' })),
}));
