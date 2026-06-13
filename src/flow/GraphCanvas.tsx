import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode
} from '@xyflow/react';
import type {
  OnNodesChange,
  OnEdgesChange,
  OnNodeDrag,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '../store/useAppStore';
import { ServiceNode } from './ServiceNode';
import { DatabaseNode } from './DatabaseNode';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodesDelete: (nodes: Node[]) => void;
  onNodeDragStop?: OnNodeDrag;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodesDelete,
  onNodeDragStop
}) => {
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);
  const setIsMobilePanelOpen = useAppStore((state) => state.setIsMobilePanelOpen);

  // Define node types memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({
    service: ServiceNode,
    database: DatabaseNode
  }), []);

  return (
    <div className="w-full h-full bg-neutral-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onNodeClick={(_event, node) => {
          setSelectedNodeId(node.id);
          if (window.innerWidth < 1024) {
            setIsMobilePanelOpen(true);
          }
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
        }}
        onNodesDelete={(deleted) => {
          onNodesDelete(deleted);
          if (deleted.some(node => node.id === selectedNodeId)) {
            setSelectedNodeId(null);
          }
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        // Custom styling for default selected states and handles
        className="text-white"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.5}
          color="#334155"
          className="opacity-70"
        />
        <Controls
          showInteractive={false}
          className="!bg-neutral-900 !border-neutral-800 !text-neutral-400 [&_button]:!border-neutral-800 hover:[&_button]:!bg-neutral-800 hover:[&_button]:!text-white"
        />
      </ReactFlow>
    </div>
  );
};
