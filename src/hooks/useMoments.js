import { useState, useEffect, useCallback } from 'react';
import { fetchAllMomentsData } from '../services/firestore/memoriesService';

/**
 * Hook to fetch and manage all moments data
 * Handles loading, error, and refetch logic
 * @returns {Object} { moments, loading, error, refetch }
 */
export const useMoments = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMoments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllMomentsData();
      setMoments(data);
    } catch (err) {
      console.error('Error fetching moments:', err);
      setError(err.message || 'Failed to load moments');
      setMoments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  const refetch = useCallback(async () => {
    await fetchMoments();
  }, [fetchMoments]);

  return {
    moments,
    loading,
    error,
    refetch,
  };
};

export default useMoments;
