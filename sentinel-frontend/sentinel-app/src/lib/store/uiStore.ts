import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  liveAlertCount: number;
  incrementAlertCount: () => void;
  resetAlertCount: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  liveAlertCount: 0,
  incrementAlertCount: () => set((s) => ({ liveAlertCount: s.liveAlertCount + 1 })),
  resetAlertCount: () => set({ liveAlertCount: 0 }),
}));
