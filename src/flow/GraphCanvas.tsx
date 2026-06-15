import React, { useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode,
  useReactFlow
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
  const isMobilePanelOpen = useAppStore((state) => state.isMobilePanelOpen);
  const setIsMobilePanelOpen = useAppStore((state) => state.setIsMobilePanelOpen);

  const { fitView } = useReactFlow();

  // Mobile double-tap detection
  const lastTapRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    if (e.touches.length === 1) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    if (!touchStartPosRef.current) return;

    const touch = e.changedTouches[0];
    if (touch) {
      const dx = touch.clientX - touchStartPosRef.current.x;
      const dy = touch.clientY - touchStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Treat as a tap if touch didn't move significantly (prevents triggers on swipe/drag)
      if (distance < 10) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          setIsMobilePanelOpen(true);
        }
        lastTapRef.current = now;
      }
    }
    touchStartPosRef.current = null;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in forms/inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // 1. Fit View: F or Ctrl + F
      if (key === 'f' || (e.ctrlKey && key === 'f')) {
        e.preventDefault();
        fitView({ duration: 400 });
      }

      // 2. Toggle Inspector Panel: P or Ctrl + B
      if (key === 'p' || (e.ctrlKey && key === 'b')) {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          // Mobile: toggle mobile sheet visibility
          setIsMobilePanelOpen(!isMobilePanelOpen);
        } else {
          // Desktop: toggle node selection state (closing/opening inspector details)
          if (selectedNodeId) {
            setSelectedNodeId(null);
          } else {
            const firstNode = nodes[0];
            if (firstNode) {
              setSelectedNodeId(firstNode.id);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fitView, isMobilePanelOpen, setIsMobilePanelOpen, selectedNodeId, setSelectedNodeId, nodes]);

  // Define node types memoized to prevent re-renders
  const nodeTypes = useMemo(() => ({
    service: ServiceNode,
    database: DatabaseNode
  }), []);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full bg-neutral-950 relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeDragStart={(_event, node) => {
          setSelectedNodeId(node.id);
          if (window.innerWidth < 1024) {
            setIsMobilePanelOpen(true);
          }
        }}
        onNodeContextMenu={(event, node) => {
          if (window.innerWidth < 1024) {
            event.preventDefault();
            window.dispatchEvent(
              new CustomEvent('node-long-press', {
                detail: { id: node.id, name: (node.data as { name?: string })?.name || 'this node' }
              })
            );
          }
        }}
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
