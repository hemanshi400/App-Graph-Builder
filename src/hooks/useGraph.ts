import { useQuery } from '@tanstack/react-query';
import { fetchGraph } from '../api/mockApi';
import type { GraphData } from '../types';

export const useGraph = (appId: string | null) => {
  return useQuery<GraphData, Error>({
    queryKey: ['graph', appId],
    queryFn: () => {
      if (!appId) throw new Error('No app ID selected');
      return fetchGraph(appId);
    },
    enabled: !!appId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
