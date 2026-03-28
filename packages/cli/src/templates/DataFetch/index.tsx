import React from 'react';
import type { DataFetchProps } from './types';
import { useDataFetch } from './useDataFetch';
import { DefaultSkeleton, DefaultErrorFallback } from './fallbacks';

/**
 * Fetches data and handles loading / error / empty / success states automatically.
 * Uses a module-level cache to deduplicate requests with the same queryKey.
 *
 * @example
 * <DataFetch
 *   queryKey={['user', userId]}
 *   queryFn={() => api.getUser(userId)}
 *   loadingFallback={<UserSkeleton />}
 *   errorFallback={({ retry }) => <ErrorCard onRetry={retry} />}
 *   emptyFallback={<p>User not found.</p>}
 * >
 *   {(user) => <UserCard user={user} />}
 * </DataFetch>
 */
export function DataFetch<T>({
  queryKey,
  queryFn,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
  staleTime = 60_000,
  retry = 3,
  retryDelay = 1000,
  className = '',
}: DataFetchProps<T>) {
  const { status, data, error, retry: retryFn } = useDataFetch<T>({
    queryKey,
    queryFn,
    staleTime,
    retry,
    retryDelay,
  });

  const renderContent = () => {
    // --- Loading ---
    if (status === 'loading' || status === 'idle') {
      return loadingFallback ?? <DefaultSkeleton />;
    }

    // --- Error ---
    if (status === 'error') {
      if (errorFallback && error) {
        return errorFallback({ error, retry: retryFn });
      }
      return <DefaultErrorFallback error={error ?? new Error('Unknown error')} retry={retryFn} />;
    }

    // --- Empty ---
    const isEmpty =
      data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0);

    if (isEmpty) {
      return emptyFallback ?? null;
    }

    // --- Success ---
    return children(data as NonNullable<T>);
  };

  return (
    <div
      className={`behave-data-fetch ${className}`.trim()}
      data-status={status}
    >
      {renderContent()}
    </div>
  );
}

DataFetch.displayName = 'DataFetch';
