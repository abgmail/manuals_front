/**
 * Type definitions for the Meilisearch API client
 */

/**
 * Basic configuration for the Meilisearch client
 */
export interface MeilisearchConfig {
  /** Meilisearch host URL */
  host: string;
  /** Meilisearch API key */
  apiKey: string;
  /** Default index to use (optional) */
  defaultIndex?: string;
  /** Debug mode flag */
  debug?: boolean;
}

/**
 * Search parameters for Meilisearch queries
 */
export interface SearchParams<T = any> {
  /** Search query string */
  query: string;
  /** Filter query in Meilisearch filter syntax */
  filter?: string;
  /** Sorting options */
  sort?: string[];
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
  /** Facets to retrieve */
  facets?: string[];
  /** Additional search options */
  options?: Record<string, any>;
}

/**
 * Search result from Meilisearch
 */
export interface SearchResult<T = any> {
  /** Array of matching documents */
  hits: T[];
  /** Original search query */
  query: string;
  /** Time taken to process the search in milliseconds */
  processingTimeMs: number;
  /** Estimated total number of matching documents */
  estimatedTotalHits: number;
  /** Maximum number of results returned */
  limit: number;
  /** Number of results skipped */
  offset: number;
  /** Facet distribution if facets were requested */
  facetDistribution?: Record<string, Record<string, number>>;
}

/**
 * Document operations result
 */
export interface DocumentOperationResult {
  /** Task ID for the operation */
  taskUid: number;
}

/**
 * Index stats
 */
export interface IndexStats {
  /** Number of documents in the index */
  numberOfDocuments: number;
  /** Whether the index is currently being indexed */
  isIndexing: boolean;
  /** Field distribution in the index */
  fieldDistribution: Record<string, number>;
}

/**
 * Task status
 */
export interface TaskInfo {
  /** Task ID */
  uid: number;
  /** Index ID */
  indexUid: string;
  /** Task status */
  status: 'enqueued' | 'processing' | 'succeeded' | 'failed';
  /** Task type */
  type: string;
  /** Enqueued at timestamp */
  enqueuedAt: string;
  /** Started at timestamp */
  startedAt?: string;
  /** Finished at timestamp */
  finishedAt?: string;
  /** Error details if failed */
  error?: {
    message: string;
    code: string;
    type: string;
    link: string;
  };
}
