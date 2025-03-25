/**
 * Meilisearch API
 * 
 * A reusable client for interacting with Meilisearch in various projects.
 * This module exports all components needed to work with Meilisearch.
 */

export * from './types';
export * from './client';
export * from './utils';

// Re-export the MeilisearchAPI class as default
import { MeilisearchAPI } from './client';
export default MeilisearchAPI;
