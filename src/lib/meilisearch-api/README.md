# Meilisearch API Client

A reusable, type-safe client for interacting with Meilisearch in various projects.

## Features

- **Fully Typed**: Complete TypeScript support with comprehensive type definitions
- **Error Handling**: Built-in error handling and validation
- **Flexible Configuration**: Configurable for different environments and use cases
- **Utility Functions**: Helpful utilities for common Meilisearch operations
- **Debug Mode**: Optional debug logging for development

## Installation

This module is part of your project. No additional installation required.

## Usage

### Basic Setup

```typescript
import MeilisearchAPI from '@/lib/meilisearch-api';

const meilisearchClient = new MeilisearchAPI({
  host: process.env.MEILISEARCH_HOST || '',
  apiKey: process.env.MEILISEARCH_KEY || '',
  defaultIndex: 'your_index',
  debug: process.env.NODE_ENV === 'development'
});
```

### Searching Documents

```typescript
// Basic search
const results = await meilisearchClient.search({
  query: 'search term',
  limit: 20,
  offset: 0
});

// Advanced search with filters
const filteredResults = await meilisearchClient.search({
  query: 'search term',
  filter: 'category = "electronics"',
  sort: ['price:asc'],
  facets: ['category', 'brand'],
  limit: 20,
  offset: 0
});

// Search in a specific index (overriding the default)
const customIndexResults = await meilisearchClient.search({
  query: 'search term'
}, 'custom_index');
```

### Document Operations

```typescript
// Add documents
await meilisearchClient.addDocuments([
  { id: 1, title: 'Document 1' },
  { id: 2, title: 'Document 2' }
]);

// Update documents
await meilisearchClient.updateDocuments([
  { id: 1, title: 'Updated Document 1' }
]);

// Delete documents
await meilisearchClient.deleteDocuments([1, 2]);

// Get a document
const document = await meilisearchClient.getDocument(1);
```

### Utility Functions

```typescript
import { 
  groupResultsByField, 
  createFilterString,
  isIdentifierQuery,
  createAttributeFilter
} from '@/lib/meilisearch-api';

// Group search results by document ID
const groupedResults = groupResultsByField(
  results,
  'document_id',
  'page_number',
  'asc'
);

// Create a filter string from an object
const filterString = createFilterString({
  category: ['electronics', 'computers'],
  inStock: [true]
});

// Check if a query is an identifier
const isIdentifier = isIdentifierQuery('ABC-123');

// Create an attribute filter for identifier queries
const attributeFilter = createAttributeFilter(
  'ABC-123',
  ['sku', 'model_number', 'article_number']
);
```

## Error Handling

The client includes built-in error handling that provides clear error messages:

```typescript
try {
  const results = await meilisearchClient.search({
    query: 'search term'
  });
} catch (error) {
  console.error('Search failed:', error.message);
}
```

## Advanced Configuration

You can customize the client behavior with various configuration options:

```typescript
const meilisearchClient = new MeilisearchAPI({
  host: process.env.MEILISEARCH_HOST || '',
  apiKey: process.env.MEILISEARCH_KEY || '',
  defaultIndex: 'your_index',
  debug: true // Enable debug logging
});
```

## Type Extensions

You can extend the base types for your specific document types:

```typescript
import { SearchResult, SearchParams } from '@/lib/meilisearch-api';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Now you can use these types with the client
const results = await meilisearchClient.search<Product>({
  query: 'laptop'
});

// Type-safe access to product properties
results.hits.forEach(product => {
  console.log(`${product.name}: ${product.price}`);
});
```
