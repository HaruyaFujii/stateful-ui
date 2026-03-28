import type React from 'react';

// ----------------------------------------------------------------
// QueryKey — TanStack Query互換のキー型（依存なしで定義）
// ----------------------------------------------------------------

export type QueryKey = readonly unknown[];

// ----------------------------------------------------------------
// DataFetch props
// ----------------------------------------------------------------

export interface DataFetchProps<T> {
  /**
   * キャッシュキー。同じキーへのリクエストは自動的に重複排除される。
   * TanStack Query の queryKey と同仕様。
   */
  queryKey: QueryKey;

  /**
   * データ取得関数。Promiseを返す任意の非同期関数。
   */
  queryFn: () => Promise<T>;

  /**
   * 取得成功時のレンダー関数（Render Props パターン）。
   * data は完全に型推論される。
   */
  children: (data: NonNullable<T>) => React.ReactNode;

  /**
   * ローディング中に表示するUI。
   * 省略時はデフォルトのスケルトンを表示。
   */
  loadingFallback?: React.ReactNode;

  /**
   * エラー時に表示するUI。
   * retry 関数を受け取り、再取得ボタン等に使える。
   */
  errorFallback?: (props: { error: Error; retry: () => void }) => React.ReactNode;

  /**
   * データが null / undefined / 空配列のときに表示するUI。
   */
  emptyFallback?: React.ReactNode;

  /**
   * キャッシュの有効期間（ms）。この時間内の再レンダーはfetchしない。
   * @default 60000
   */
  staleTime?: number;

  /**
   * エラー時の自動リトライ回数。false で無効化。
   * @default 3
   */
  retry?: number | false;

  /**
   * リトライ間隔（ms）。
   * @default 1000
   */
  retryDelay?: number;

  /**
   * このコンポーネントのルート要素に付与するクラス名。
   */
  className?: string;
}

// ----------------------------------------------------------------
// 内部状態
// ----------------------------------------------------------------

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FetchState<T> {
  status: FetchStatus;
  data: T | null;
  error: Error | null;
  /** fetchを実行した回数（リトライ含む） */
  fetchCount: number;
}
