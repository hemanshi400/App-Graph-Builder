import React from 'react';
import type { NodeProps } from '@xyflow/react';
import type { ServiceNodeData } from '../types';
import { BaseNode } from './BaseNode';
import { Database } from 'lucide-react';

export const DatabaseNode: React.FC<NodeProps> = ({ data, selected }) => {
  const serviceData = data as ServiceNodeData;
  const { name, status, value } = serviceData;

  return (
    <BaseNode
      selected={selected}
      accentColor="green"
      typeLabel="Database"
      typeColorClass="text-emerald-400 font-bold"
      defaultIcon={<Database className="h-4.5 w-4.5" />}
      name={name}
      value={value}
      status={status}
    />
  );
};
