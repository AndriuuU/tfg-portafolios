import { useState, useEffect } from 'react';

/**
 * Hook genérico para llamadas a API con loading y error handling
 * Previene memory leaks con cleanup
 */
export function useApi(apiCall, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCall();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error inesperado');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiCall();
        if (!cancelled) {
          setData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Error inesperado');
          console.error('API Error:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();
    
    // Cleanup para prevenir setState en componente desmontado
    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error, refetch };
}

export default useApi;
