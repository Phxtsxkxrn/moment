import { useState, useEffect, useCallback } from 'react';
import { getGridSettingsWithMoments } from '../services/firestore/gridService';

/**
 * Hook to fetch and manage grid settings and associated moments
 * Handles loading, error, and refetch logic
 * @returns {Object} { gridSettings, gridMoments, loading, error, refetch }
 */
export const useGridMoments = () => {
  const [gridSettings, setGridSettings] = useState(null);
  const [gridMoments, setGridMoments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGridData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { settings, moments } = await getGridSettingsWithMoments();
      setGridSettings(settings);
      setGridMoments(moments);
    } catch (err) {
      console.error('Error fetching grid data:', err);
      setError(err.message || 'Failed to load grid settings');
      setGridSettings(null);
      setGridMoments({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  const refetch = useCallback(async () => {
    await fetchGridData();
  }, [fetchGridData]);

  return {
    gridSettings,
    gridMoments,
    loading,
    error,
    refetch,
  };
};

export default useGridMoments;
