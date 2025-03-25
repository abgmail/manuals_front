/**
 * Meilisearch API Client
 * 
 * A reusable client for interacting with Meilisearch in various projects.
 */
import { MeiliSearch, Index, Task, WaitOptions } from 'meilisearch';
import { 
  MeilisearchConfig, 
  SearchParams, 
  SearchResult,
  DocumentOperationResult,
  IndexStats,
  TaskInfo
} from './types';
import * as utils from './utils';

/**
 * MeilisearchAPI class provides a wrapper around the Meilisearch client
 * with additional error handling and convenience methods.
 */
export class MeilisearchAPI {
  private client: MeiliSearch;
  private config: MeilisearchConfig;
  public utils = utils;
  
  /**
   * Creates a new MeilisearchAPI instance
   * @param config Configuration for the Meilisearch client
   */
  constructor(config: MeilisearchConfig) {
    this.config = {
      debug: process.env.NODE_ENV === 'development',
      ...config
    };
    
    // Initialize the Meilisearch client
    this.client = new MeiliSearch({
      host: this.config.host,
      apiKey: this.config.apiKey,
    });
    
    // Log configuration in debug mode
    if (this.config.debug) {
      console.log('Meilisearch Konfiguration:');
      console.log(`- Host: ${this.config.host ? 'Definiert' : 'FEHLT'}`);
      console.log(`- API Key: ${this.config.apiKey ? 'Definiert' : 'FEHLT'}`);
      console.log(`- Default Index: ${this.config.defaultIndex || 'Nicht definiert'}`);
    }
  }
  
  /**
   * Validates the client configuration
   * @throws Error if the configuration is invalid
   */
  private validateConfig(): void {
    if (!this.config.host) {
      throw new Error('Meilisearch Host ist nicht konfiguriert');
    }
  }
  
  /**
   * Gets an index instance
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Index instance
   */
  public getIndex(indexName?: string): Index {
    this.validateConfig();
    
    const index = indexName || this.config.defaultIndex;
    if (!index) {
      throw new Error('Kein Index angegeben und kein Standard-Index konfiguriert');
    }
    
    return this.client.index(index);
  }
  
  /**
   * Performs a search on the specified index
   * @param params Search parameters
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Search results
   */
  public async search<T extends Record<string, any>>(
    params: SearchParams,
    indexName?: string
  ): Promise<SearchResult<T>> {
    try {
      const { query, filter, sort, limit = 20, offset = 0, facets, options = {} } = params;
      
      if (this.config.debug) {
        console.log('Meilisearch Anfrage:', {
          index: indexName || this.config.defaultIndex,
          query,
          filter,
          sort,
          limit,
          offset,
          facets,
          ...options
        });
      }
      
      const index = this.getIndex(indexName);
      
      // Versuche, eine Verbindung zum Index herzustellen, um zu prüfen, ob die Verbindung funktioniert
      try {
        await index.getRawInfo();
      } catch (connectionError) {
        console.error('Verbindungsfehler zu Meilisearch:', connectionError);
        throw new Error(`Verbindungsfehler zu Meilisearch: ${connectionError instanceof Error ? connectionError.message : String(connectionError)}`);
      }
      
      const results = await index.search(query, {
        filter,
        sort,
        limit,
        offset,
        facets,
        ...options
      });
      
      if (this.config.debug) {
        console.log(`Meilisearch Antwort: ${results.hits.length} Treffer von ${results.estimatedTotalHits}`);
      }
      
      return results as unknown as SearchResult<T>;
    } catch (error) {
      this.handleError('Fehler bei der Suche', error);
      throw error;
    }
  }
  
  /**
   * Adds or replaces documents in the specified index
   * @param documents Documents to add or replace
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Operation result
   */
  public async addDocuments<T extends Record<string, any>>(
    documents: T[],
    indexName?: string
  ): Promise<DocumentOperationResult> {
    try {
      const index = this.getIndex(indexName);
      return await index.addDocuments(documents);
    } catch (error) {
      this.handleError('Fehler beim Hinzufügen von Dokumenten', error);
      throw error;
    }
  }
  
  /**
   * Updates documents in the specified index
   * @param documents Documents to update
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Operation result
   */
  public async updateDocuments<T extends Record<string, any>>(
    documents: T[],
    indexName?: string
  ): Promise<DocumentOperationResult> {
    try {
      const index = this.getIndex(indexName);
      return await index.updateDocuments(documents);
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren von Dokumenten', error);
      throw error;
    }
  }
  
  /**
   * Deletes documents from the specified index
   * @param documentIds IDs of documents to delete
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Operation result
   */
  public async deleteDocuments(
    documentIds: string[] | number[],
    indexName?: string
  ): Promise<DocumentOperationResult> {
    try {
      const index = this.getIndex(indexName);
      return await index.deleteDocuments(documentIds);
    } catch (error) {
      this.handleError('Fehler beim Löschen von Dokumenten', error);
      throw error;
    }
  }
  
  /**
   * Gets a document by ID from the specified index
   * @param documentId ID of the document to get
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Document
   */
  public async getDocument<T extends Record<string, any>>(
    documentId: string | number,
    indexName?: string
  ): Promise<T> {
    try {
      const index = this.getIndex(indexName);
      return await index.getDocument(documentId) as unknown as T;
    } catch (error) {
      this.handleError('Fehler beim Abrufen des Dokuments', error);
      throw error;
    }
  }
  
  /**
   * Gets multiple documents by ID from the specified index
   * @param documentIds IDs of the documents to get
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Documents
   */
  public async getDocuments<T extends Record<string, any>>(
    documentIds: (string | number)[],
    indexName?: string
  ): Promise<T[]> {
    try {
      const index = this.getIndex(indexName);
      const results = await index.getDocuments({ filter: `id IN [${documentIds.join(',')}]` });
      return results.results as unknown as T[];
    } catch (error) {
      this.handleError('Fehler beim Abrufen der Dokumente', error);
      throw error;
    }
  }
  
  /**
   * Gets stats for the specified index
   * @param indexName Name of the index (optional, uses default index if not provided)
   * @returns Index stats
   */
  public async getStats(indexName?: string): Promise<IndexStats> {
    try {
      const index = this.getIndex(indexName);
      return await index.getStats();
    } catch (error) {
      this.handleError('Fehler beim Abrufen der Statistiken', error);
      throw error;
    }
  }
  
  /**
   * Gets the status of a task
   * @param taskId ID of the task
   * @returns Task status
   */
  public async getTask(taskId: number): Promise<TaskInfo> {
    try {
      const task = await this.client.getTask(taskId);
      return task as unknown as TaskInfo;
    } catch (error) {
      this.handleError('Fehler beim Abrufen des Task-Status', error);
      throw error;
    }
  }
  
  /**
   * Waits for a task to complete
   * @param taskId ID of the task
   * @param timeOutMs Timeout in milliseconds (default: 5000)
   * @param intervalMs Polling interval in milliseconds (default: 50)
   * @returns Task status
   */
  public async waitForTask(
    taskId: number,
    timeOutMs: number = 5000,
    intervalMs: number = 50
  ): Promise<TaskInfo> {
    try {
      const options: WaitOptions = { timeOutMs, intervalMs };
      const task = await this.client.waitForTask(taskId, options);
      return task as unknown as TaskInfo;
    } catch (error) {
      this.handleError('Fehler beim Warten auf Task-Abschluss', error);
      throw error;
    }
  }
  
  /**
   * Handles errors in a consistent way
   * @param message Error message prefix
   * @param error Error object
   */
  private handleError(message: string, error: unknown): void {
    if (this.config.debug) {
      console.error(`${message}:`, error);
      
      // Detaillierte Fehlerinformationen im Entwicklungsmodus
      if (error instanceof Error) {
        console.error('Fehlerdetails:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      } else {
        console.error('Unbekannter Fehlertyp:', error);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(`${message}: ${error.message}`);
    }
    
    throw new Error(`${message}: ${String(error)}`);
  }
}
