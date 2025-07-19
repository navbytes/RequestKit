import { useState, useCallback } from 'preact/hooks';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncActions<T> {
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
}

/**
 * Custom hook for managing async operations with loading and error states
 */
export function useAsyncState<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>
): AsyncState<T> & AsyncActions<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}
