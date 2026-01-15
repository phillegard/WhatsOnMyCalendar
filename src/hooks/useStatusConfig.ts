import { useStore } from '../store/useStore';

/**
 * Hook for accessing status configuration
 */
export function useStatusConfig() {
  const statuses = useStore((state) => state.statuses);
  const statusConfigs = useStore((state) => state.statusConfigs);
  const getStatusColor = useStore((state) => state.getStatusColor);

  return {
    statuses,
    statusConfigs,
    getStatusColor,
  };
}
