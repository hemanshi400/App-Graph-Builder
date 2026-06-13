import { create } from 'zustand';
import type { AppStoreState } from '../types';

export const useAppStore = create<AppStoreState>((set) => ({
  selectedAppId: null,
  selectedNodeId: null,
  isMobilePanelOpen: false,
  activeInspectorTab: 'config',
  setSelectedAppId: (appId) => set({ selectedAppId: appId, selectedNodeId: null }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setIsMobilePanelOpen: (isOpen) => set({ isMobilePanelOpen: isOpen }),
  setActiveInspectorTab: (tab) => set({ activeInspectorTab: tab }),
}));
