import React from 'react';
import type { NodeProps } from '@xyflow/react';
import type { ServiceNodeData } from '../types';
import { BaseNode } from './BaseNode';
import { Cpu } from 'lucide-react';

export const ServiceNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const serviceData = data as ServiceNodeData;
  const { name, status, value } = serviceData;

  return (
    <BaseNode
      id={id}
      selected={selected}
      accentColor="blue"
      typeLabel="Service"
      typeColorClass="text-sky-400 font-bold"
      defaultIcon={<Cpu className="h-4.5 w-4.5" />}
      name={name}
      value={value}
      status={status}
    />
  );
};
