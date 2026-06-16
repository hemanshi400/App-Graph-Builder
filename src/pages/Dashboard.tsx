import { useCallback, useState, useEffect } from 'react';
import { ReactFlowProvider, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Node, NodeChange, EdgeChange } from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { useGraph } from '../hooks/useGraph';
import { updateMockGraph } from '../api/mockApi';
import { TopBar } from '../layout/TopBar';
import { LeftRail } from '../layout/LeftRail';
import { RightPanel } from '../layout/RightPanel';
import { GraphCanvas } from '../flow/GraphCanvas';
import type { ServiceNode, ServiceStatus, GraphData } from '../types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const selectedAppId = useAppStore((state) => state.selectedAppId);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const queryClient = useQueryClient();

  // Long press mobile deletion states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);

  // TanStack Query hook
  const { data: graphData, isLoading, isError, error, refetch } = useGraph(selectedAppId);

  // Derivate nodes and edges directly from TanStack Query cache (no duplicate local state!)
  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Find currently selected node directly from the query data
  const selectedNode = (nodes.find((n) => n.id === selectedNodeId) as ServiceNode) || null;

  // ReactFlow onNodesChange callback updating TanStack Query cache directly
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!selectedAppId) return;
      queryClient.setQueryData(['graph', selectedAppId], (old: GraphData | undefined) => {
        if (!old) return old;
        const updatedNodes = applyNodeChanges(changes, old.nodes) as ServiceNode[];
        
        // Sync to mock database immediately for persistent changes (e.g. deletion from changes list)
        const hasPersistentChange = changes.some(
          (c) => c.type === 'remove'
        );
        if (hasPersistentChange) {
          updateMockGraph(selectedAppId, updatedNodes, old.edges);
        }
        
        return {
          ...old,
          nodes: updatedNodes,
        };
      });
    },
    [selectedAppId, queryClient]
  );

  // ReactFlow onEdgesChange callback updating TanStack Query cache directly
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!selectedAppId) return;
      queryClient.setQueryData(['graph', selectedAppId], (old: GraphData | undefined) => {
        if (!old) return old;
        const updatedEdges = applyEdgeChanges(changes, old.edges);
        
        const hasPersistentChange = changes.some(
          (c) => c.type === 'remove'
        );
        if (hasPersistentChange) {
          updateMockGraph(selectedAppId, old.nodes, updatedEdges);
        }
        
        return {
          ...old,
          edges: updatedEdges,
        };
      });
    },
    [selectedAppId, queryClient]
  );

  // ReactFlow onNodeDragStop callback to persist final coordinates to the mock database
  const handleNodeDragStop = useCallback(() => {
    if (!selectedAppId) return;
    const currentGraph = queryClient.getQueryData<GraphData>(['graph', selectedAppId]);
    if (currentGraph) {
      updateMockGraph(selectedAppId, currentGraph.nodes, currentGraph.edges);
    }
  }, [selectedAppId, queryClient]);

  // Handler to update selected node data (e.g. from Inspector inputs)
  const handleUpdateNode = useCallback(
    (
      id: string,
      updatedFields: { name?: string; description?: string; value?: number; status?: ServiceStatus; type?: 'service' | 'database' }
    ) => {
      if (!selectedAppId) return;
      queryClient.setQueryData(['graph', selectedAppId], (old: GraphData | undefined) => {
        if (!old) return old;
        const updatedNodes = old.nodes.map((node) => {
          if (node.id === id) {
            const { type, ...dataFields } = updatedFields;
            return {
              ...node,
              ...(type ? { type } : {}),
              data: {
                ...node.data,
                ...dataFields,
              },
            };
          }
          return node;
        });

        // Persist modification in mock database in background
        updateMockGraph(selectedAppId, updatedNodes, old.edges);

        return {
          ...old,
          nodes: updatedNodes,
        };
      });
    },
    [selectedAppId, queryClient]
  );

  // Handler for nodes deleted via ReactFlow interactions (Backspace/Delete)
  const handleNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      if (deletedNodes.some((node) => node.id === selectedNodeId)) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId, setSelectedNodeId]
  );

  // Delete node manually (used by mobile long-press deletion modal)
  const deleteNode = useCallback(
    (nodeId: string) => {
      if (!selectedAppId) return;
      queryClient.setQueryData(['graph', selectedAppId], (old: GraphData | undefined) => {
        if (!old) return old;
        const updatedNodes = old.nodes.filter((n) => n.id !== nodeId);
        const updatedEdges = old.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        
        // Persist in mock database
        updateMockGraph(selectedAppId, updatedNodes, updatedEdges);
        
        return {
          ...old,
          nodes: updatedNodes,
          edges: updatedEdges,
        };
      });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [selectedAppId, selectedNodeId, setSelectedNodeId, queryClient]
  );

  // Listen to mobile long-press (touch and hold) DOM events dispatched from BaseNode.tsx
  useEffect(() => {
    const handleNodeLongPress = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; name: string }>;
      const { id, name } = customEvent.detail;
      setNodeToDelete({ id, data: { name } } as unknown as Node);
      setShowDeleteDialog(true);
    };

    window.addEventListener('node-long-press', handleNodeLongPress);
    return () => {
      window.removeEventListener('node-long-press', handleNodeLongPress);
    };
  }, []);

  // Handler to add a new Service Node at a sensible position
  const handleAddNode = useCallback(() => {
    if (!selectedAppId) return;
    const newNode: ServiceNode = {
      id: crypto.randomUUID(),
      type: 'service',
      position: { x: 300, y: 200 },
      data: {
        name: 'New Service',
        status: 'healthy',
        value: 50,
        description: '',
      },
    };

    queryClient.setQueryData(['graph', selectedAppId], (old: GraphData | undefined) => {
      if (!old) return old;
      const updatedNodes = [...old.nodes, newNode];
      
      // Persist in mock database
      updateMockGraph(selectedAppId, updatedNodes, old.edges);

      return {
        ...old,
        nodes: updatedNodes,
      };
    });
  }, [selectedAppId, queryClient]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen bg-neutral-950 text-white overflow-hidden">
        {/* Top Header */}
        <TopBar onAddNode={handleAddNode} />

        {/* Workspace Body */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Static Left Navigation */}
          <LeftRail />

          {/* Center Canvas Area */}
          <main className="flex-1 min-w-0 relative flex flex-col">
            {isLoading ? (
              <div className="absolute inset-0 bg-neutral-950/90 z-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-sm text-neutral-400 font-medium">Loading infrastructure graph...</p>
              </div>
            ) : isError ? (
              <div className="absolute inset-0 bg-neutral-950/90 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Failed to load graph</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-md">
                    {error?.message || 'An unexpected error occurred while fetching the application graph.'}
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Load
                </Button>
              </div>
            ) : !selectedAppId ? (
              <div className="absolute inset-0 bg-neutral-950 z-20 flex flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-sm text-neutral-500">Select an application to view its architecture graph.</p>
              </div>
            ) : null}

            {/* Canvas */}
            <div className="flex-1 w-full h-full">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodesDelete={handleNodesDelete}
                onNodeDragStop={handleNodeDragStop}
                onAddNode={handleAddNode}
              />
            </div>
          </main>

          {/* Right Inspector & List Panel */}
          <RightPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>

      {/* Mobile touch-and-hold deletion confirmation dialog */}
      {showDeleteDialog && nodeToDelete && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-neutral-200">
            <h3 className="text-base font-bold text-white mb-2">Delete Node?</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold font-mono">"{String(nodeToDelete.data?.name || 'this node')}"</span>? This will also remove any connected network edges.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setNodeToDelete(null);
                }}
                className="border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-805 hover:bg-neutral-800 text-xs px-4 py-2 h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (nodeToDelete) {
                    deleteNode(nodeToDelete.id);
                  }
                  setShowDeleteDialog(false);
                  setNodeToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white border-none text-xs px-4 py-2 h-9 shadow-lg shadow-rose-600/20"
              >
                Delete Node
              </Button>
            </div>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  );
};

export default Dashboard;
