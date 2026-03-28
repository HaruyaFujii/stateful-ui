import { useCallback, useEffect, useRef, useState } from 'react';
import type { QueryKey, FetchState } from './types';

// ----------------------------------------------------------------
// Module-level cache（コンポーネントをまたいで共有）
// ----------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// グローバルキャッシュ：Map<serializedKey, CacheEntry>
const cache = new Map<string, CacheEntry<unknown>>();

function serializeKey(key: QueryKey): string {
  return JSON.stringify(key);
}

function isFresh(entry: CacheEntry<unknown>, staleTime: number): boolean {
  return Date.now() - entry.timestamp < staleTime;
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------

export interface UseDataFetchOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  staleTime?: number;
  retry?: number | false;
  retryDelay?: number;
}

export interface UseDataFetchReturn<T> {
  status: FetchState<T>['status'];
  data: T | null;
  error: Error | null;
  retry: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useDataFetch<T>({
  queryKey,
  queryFn,
  staleTime = 60_000,
  retry = 3,
  retryDelay = 1000,
}: UseDataFetchOptions<T>): UseDataFetchReturn<T> {
  const serializedKey = serializeKey(queryKey);

  // キャッシュがフレッシュなら初期値として使う
  const cachedEntry = cache.get(serializedKey) as CacheEntry<T> | undefined;
  const hasFreshtCache = cachedEntry !== undefined && isFresh(cachedEntry, staleTime);

  const [state, setState] = useState<FetchState<T>>(() =>
    hasFreshtCache
      ? { status: 'success', data: cachedEntry.data, error: null, fetchCount: 0 }
      : { status: 'idle', data: null, error: null, fetchCount: 0 }
  );

  // 進行中フェッチのIDで古いレスポンスを無視する
  const fetchIdRef = useRef(0);
  // リトライのタイマーID
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // シリアライズキーの変化を検知するためのref
  const serializedKeyRef = useRef(serializedKey);

  const executeWithRetry = useCallback(
    async (fetchId: number, attempt: number) => {
      try {
        const data = await queryFn();

        // 古いfetchの結果は無視
        if (fetchId !== fetchIdRef.current) return;

        // キャッシュに保存
        cache.set(serializedKeyRef.current, { data, timestamp: Date.now() });

        setState((prev) => ({
          status: 'success',
          data,
          error: null,
          fetchCount: prev.fetchCount + 1,
        }));
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;

        const error = err instanceof Error ? err : new Error(String(err));
        const maxRetry = retry === false ? 0 : retry;
        const shouldRetry = attempt < maxRetry;

        if (shouldRetry) {
          retryTimerRef.current = setTimeout(() => {
            if (fetchId === fetchIdRef.current) {
              void executeWithRetry(fetchId, attempt + 1);
            }
          }, retryDelay);
        } else {
          setState((prev) => ({
            status: 'error',
            data: null,
            error,
            fetchCount: prev.fetchCount + 1,
          }));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryFn, retry, retryDelay]
  );

  const startFetch = useCallback(() => {
    // 進行中のリトライをキャンセル
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    const fetchId = ++fetchIdRef.current;
    setState({ status: 'loading', data: null, error: null, fetchCount: 0 });
    void executeWithRetry(fetchId, 0);
  }, [executeWithRetry]);

  // queryKeyが変わったらリフェッチ
  useEffect(() => {
    serializedKeyRef.current = serializedKey;

    // キャッシュがフレッシュなら即座にsuccess
    const entry = cache.get(serializedKey) as CacheEntry<T> | undefined;
    if (entry && isFresh(entry, staleTime)) {
      setState({ status: 'success', data: entry.data, error: null, fetchCount: 0 });
      return;
    }

    startFetch();

    return () => {
      // アンマウント時に進行中フェッチを無効化
      fetchIdRef.current++;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
    // serializedKey が変わったときだけ再実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedKey]);

  const retry_fn = useCallback(() => {
    startFetch();
  }, [startFetch]);

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    retry: retry_fn,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}

// テスト用にキャッシュをクリアできるようにエクスポート
export function clearDataFetchCache(): void {
  cache.clear();
}
