import type { Node, Edge } from '@xyflow/react';

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface ServiceNodeData {
  name: string;
  status: ServiceStatus;
  value: number;
  description?: string;
  [key: string]: unknown;
}

export type ServiceNode = Node<ServiceNodeData, 'service'>;

export interface AppItem {
  id: string;
  name: string;
}

export interface GraphData {
  nodes: ServiceNode[];
  edges: Edge[];
}

export interface AppStoreState {
  selectedAppId: string | null;
  selectedNodeId: string | null;
  isMobilePanelOpen: boolean;
  activeInspectorTab: string;
  setSelectedAppId: (appId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setIsMobilePanelOpen: (isOpen: boolean) => void;
  setActiveInspectorTab: (tab: string) => void;
}
