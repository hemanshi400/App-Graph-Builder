import React from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ServiceNode, ServiceStatus } from '../types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Settings, HardDrive, Info, Activity } from 'lucide-react';

interface NodeInspectorProps {
  node: ServiceNode | null;
  onUpdateNode: (id: string, data: { name?: string; description?: string; value?: number; status?: ServiceStatus; type?: 'service' | 'database' }) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onUpdateNode }) => {
  const activeTab = useAppStore((state) => state.activeInspectorTab);
  const setActiveTab = useAppStore((state) => state.setActiveInspectorTab);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
        <Info className="h-10 w-10 text-neutral-600 mb-3" />
        <h3 className="text-sm font-semibold text-neutral-400">No Node Selected</h3>
        <p className="text-xs text-neutral-500 max-w-[200px] mt-1">
          Click on a canvas node to inspect and edit its configurations.
        </p>
      </div>
    );
  }

  const { name, status, value, description = '' } = node.data;

  // Handle synchronized value updates (0-100)
  const handleValueChange = (newValue: number) => {
    // Clamp between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, isNaN(newValue) ? 0 : newValue));
    onUpdateNode(node.id, { value: clampedValue });
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20">Down</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl text-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-xs text-neutral-500 font-mono">ID: {node.id}</span>
          <h3 className="text-sm font-bold text-white truncate">{name || 'Service Node'}</h3>
        </div>
        <div>
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-4 pt-3 bg-neutral-950/40">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-800 text-neutral-400">
              <TabsTrigger
                value="config"
                className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white gap-1.5 text-xs"
              >
                <Settings className="h-3.5 w-3.5" />
                Config
              </TabsTrigger>
              <TabsTrigger
                value="runtime"
                className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white gap-1.5 text-xs"
              >
                <Cpu className="h-3.5 w-3.5" />
                Runtime
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white gap-1.5 text-xs"
              >
                <Activity className="h-3.5 w-3.5" />
                Metrics
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="config" className="mt-0 space-y-4">
              {/* Node Type Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">
                  Node Type
                </label>
                <select
                  value={node.type || 'service'}
                  onChange={(e) => onUpdateNode(node.id, { type: e.target.value as 'service' | 'database' })}
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="service">Service Node (Blue)</option>
                  <option value="database">Database Node (Green)</option>
                </select>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400" htmlFor="node-name">
                  Service Name
                </label>
                <Input
                  id="node-name"
                  value={name}
                  onChange={(e) => onUpdateNode(node.id, { name: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-600 focus-visible:ring-offset-0 placeholder:text-neutral-600"
                  placeholder="e.g. Postgres DB"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400" htmlFor="node-desc">
                  Description
                </label>
                <Textarea
                  id="node-desc"
                  value={description}
                  onChange={(e) => onUpdateNode(node.id, { description: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-indigo-600 focus-visible:ring-offset-0 placeholder:text-neutral-600 min-h-[120px] resize-none"
                  placeholder="Describe what this service does..."
                />
              </div>
            </TabsContent>

            <TabsContent value="runtime" className="mt-0 space-y-5">
              {/* Status Display */}
              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Node Health Status</span>
                  <span className="text-xs text-neutral-600 block mt-0.5">Determined by system checks</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Select status group just to make status editable in a clean way */}
                  <select
                    value={status}
                    onChange={(e) => onUpdateNode(node.id, { status: e.target.value as ServiceStatus })}
                    className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                  </select>
                </div>
              </div>

              {/* Slider + Numeric Input Synchronization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
                    Utilization Limit
                  </label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleValueChange(parseInt(e.target.value, 10))}
                      className="w-16 h-7 px-1.5 py-0.5 text-center bg-neutral-950 border-neutral-800 text-white font-mono text-xs focus-visible:ring-indigo-600 focus-visible:ring-offset-0"
                      min={0}
                      max={100}
                    />
                    <span className="text-xs text-neutral-500 font-mono">%</span>
                  </div>
                </div>

                <div className="px-1 py-2">
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => handleValueChange(vals[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="py-1 cursor-pointer [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-indigo-400 [&_[data-slot=slider-thumb]]:border-neutral-950 [&_[data-slot=slider-thumb]]:size-4"
                  />
                </div>

                <p className="text-[10px] text-neutral-500 italic">
                  Drag the slider or type a number to synchronize utilization. Updates are persisted immediately in node state.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="mt-0 space-y-3">
              {/* CPU Usage */}
              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-450 text-neutral-300 block font-semibold">CPU Usage</span>
                  <span className="text-[10.5px] text-neutral-550 text-neutral-500 block mt-0.5">Direct utilization limit</span>
                </div>
                <span className="text-sm font-mono text-emerald-450 text-emerald-400 font-bold">{Math.round(value)}%</span>
              </div>

              {/* Memory Usage */}
              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-450 text-neutral-300 block font-semibold">Memory Usage</span>
                  <span className="text-[10.5px] text-neutral-550 text-neutral-500 block mt-0.5">Derived at 80% limit</span>
                </div>
                <span className="text-sm font-mono text-indigo-450 text-indigo-400 font-bold">{Math.round(value * 0.8)}%</span>
              </div>

              {/* Disk Usage */}
              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-450 text-neutral-300 block font-semibold">Disk Usage</span>
                  <span className="text-[10.5px] text-neutral-550 text-neutral-500 block mt-0.5">Derived at 120% limit</span>
                </div>
                <span className="text-sm font-mono text-indigo-350 text-sky-400 font-bold">{Math.min(100, Math.round(value * 1.2))}%</span>
              </div>

              {/* Last Updated */}
              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-450 text-neutral-300 block font-semibold">Last Updated</span>
                  <span className="text-[10.5px] text-neutral-550 text-neutral-500 block mt-0.5">Deterministic refresh metric</span>
                </div>
                <span className="text-xs text-neutral-550 text-neutral-400 font-mono font-semibold">
                  {value % 2 === 0 ? 'Just now' : `${(value % 5) + 1} mins ago`}
                </span>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
