import { useQuery } from '@tanstack/react-query';
import { fetchApps } from '../api/mockApi';
import type { AppItem } from '../types';

export const useApps = () => {
  return useQuery<AppItem[], Error>({
    queryKey: ['apps'],
    queryFn: fetchApps,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
