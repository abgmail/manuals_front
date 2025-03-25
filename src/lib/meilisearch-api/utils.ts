/**
 * Utility functions for working with Meilisearch
 */
import { SearchResult } from './types';

/**
 * Groups search results by a specific field to remove duplicates
 * @param results Original search results
 * @param groupByField Field to group by (e.g., 'document_id')
 * @param priorityField Field to prioritize when selecting which document to keep (e.g., 'page_number')
 * @param priorityDirection 'asc' for ascending (lower values first) or 'desc' for descending (higher values first)
 * @returns Grouped search results
 */
export function groupResultsByField<T extends Record<string, any>>(
  results: SearchResult<T>,
  groupByField: keyof T,
  priorityField?: keyof T,
  priorityDirection: 'asc' | 'desc' = 'asc'
): SearchResult<T> {
  // Prüfe, ob gültige Ergebnisse vorhanden sind
  if (!results || !results.hits || !Array.isArray(results.hits)) {
    console.error('Ungültige Suchergebnisse für Gruppierung:', results);
    // Erstelle ein leeres SearchResult-Objekt mit den erforderlichen Eigenschaften
    return {
      hits: [],
      query: '',
      processingTimeMs: 0,
      estimatedTotalHits: 0,
      facetDistribution: {},
      limit: 0,
      offset: 0
    } as SearchResult<T>;
  }
  
  // Gruppiere die Ergebnisse nach dem angegebenen Feld
  const groupedHits: Record<string, T> = {};
  
  // Für jedes Ergebnis
  results.hits.forEach(hit => {
    const groupValue = String(hit[groupByField]);
    
    // Wenn kein Prioritätsfeld angegeben ist, behalte einfach das erste Ergebnis pro Gruppe
    if (!priorityField) {
      if (!groupedHits[groupValue]) {
        groupedHits[groupValue] = hit;
      }
      return;
    }
    
    // Wenn dieses Dokument noch nicht in der Gruppe ist, füge es hinzu
    if (!groupedHits[groupValue]) {
      groupedHits[groupValue] = hit;
      return;
    }
    
    // Vergleiche mit dem vorhandenen Dokument basierend auf dem Prioritätsfeld
    const existingValue = groupedHits[groupValue][priorityField];
    const currentValue = hit[priorityField];
    
    // Entscheide, ob das aktuelle Dokument das vorhandene ersetzen soll
    let shouldReplace = false;
    
    if (priorityDirection === 'asc') {
      // Bei aufsteigender Sortierung bevorzugen wir niedrigere Werte
      shouldReplace = currentValue < existingValue;
    } else {
      // Bei absteigender Sortierung bevorzugen wir höhere Werte
      shouldReplace = currentValue > existingValue;
    }
    
    if (shouldReplace) {
      groupedHits[groupValue] = hit;
    }
  });
  
  // Konvertiere die gruppierten Ergebnisse zurück in ein Array
  const groupedResults = Object.values(groupedHits);
  
  // Erstelle ein neues SearchResult-Objekt mit den gruppierten Ergebnissen
  return {
    ...results,
    hits: groupedResults,
    estimatedTotalHits: groupedResults.length
  };
}

/**
 * Creates a filter string for Meilisearch from a filter object
 * @param filters Filter object where keys are field names and values are arrays of values
 * @returns Filter string in Meilisearch format
 */
export function createFilterString(
  filters: Record<string, string[] | number[] | boolean[]>
): string | undefined {
  const filterParts: string[] = [];
  
  if (!filters) return undefined;
  
  Object.entries(filters).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      const valueFilters = values.map(value => {
        // Handle different value types
        if (typeof value === 'string') {
          return `${key} = "${value}"`;
        } else {
          return `${key} = ${value}`;
        }
      }).join(' OR ');
      
      filterParts.push(`(${valueFilters})`);
    }
  });
  
  return filterParts.length > 0 ? filterParts.join(' AND ') : undefined;
}

/**
 * Detects if a query string is likely to be an identifier (like SKU, product ID, etc.)
 * @param query Query string to check
 * @param pattern Regular expression pattern to match against (default: alphanumeric with hyphens)
 * @param minLength Minimum length for the query to be considered an identifier (default: 5)
 * @returns True if the query matches the identifier pattern
 */
export function isIdentifierQuery(
  query: string,
  pattern: RegExp = /^[A-Za-z0-9-]+$/,
  minLength: number = 5
): boolean {
  if (!query) return false;
  
  const trimmedQuery = query.trim();
  return pattern.test(trimmedQuery) && trimmedQuery.length >= minLength;
}

/**
 * Erstellt eine alternative Suchstrategie für Identifier-Abfragen ohne CONTAINS-Filter
 * @param params Ursprüngliche Suchparameter
 * @param query Die Suchanfrage
 * @returns Angepasste Suchparameter für die Suche ohne CONTAINS
 */
export function createAlternativeSearchStrategy(
  params: any,
  query: string
): any {
  if (!params || !query) {
    return params || {};
  }
  
  // Kopiere die Parameter, um sie nicht zu verändern
  const enhancedParams = { ...params };
  
  // Verwende die Suchanfrage als Suchbegriff (für Volltextsuche)
  enhancedParams.query = query;
  
  // Füge einen Filter für exakte SKU-Übereinstimmung hinzu
  enhancedParams.filter = `skus = "${query}"`;
  
  return enhancedParams;
}

/**
 * Creates an attribute search filter for identifier-like queries
 * @param query The query string
 * @param attributes Array of attribute names to search in
 * @returns A filter string for searching in the specified attributes
 */
export function createAttributeFilter(
  query: string,
  attributes: string[]
): string {
  if (!query || !attributes || !Array.isArray(attributes) || attributes.length === 0) {
    return '';
  }
  
  // Verfügbare filterbare Attribute in Meilisearch
  const filterableAttributes = ['document_date', 'filename', 'skus', 'tags'];
  
  // Für jedes Attribut eine Bedingung erstellen, aber nur für filterbare Attribute
  const conditions = attributes
    .filter(attr => filterableAttributes.includes(attr))
    .map(attr => {
      // Für Arrays wie 'skus' müssen wir prüfen, ob der Wert im Array enthalten ist
      if (attr === 'skus') {
        return `${attr} = "${query}"`;
      }
      
      // Für Textfelder wie 'filename' können wir auch teilweise Übereinstimmungen suchen
      if (attr === 'filename') {
        return `${attr} = "${query}"`;
      }
      
      // Standardfall: exakte Übereinstimmung
      return `${attr} = "${query}"`;
    });
  
  // Kombiniere alle Bedingungen mit ODER
  return conditions.join(' OR ');
}

/**
 * Enhances search parameters for intelligent searching
 * @param params Original search parameters
 * @param query The search query
 * @param options Configuration options
 * @returns Enhanced search parameters with intelligent search logic applied
 */
export function enhanceSearchParams<T>(
  params: any,
  query: string,
  options: {
    identifierPattern?: RegExp;
    minIdentifierLength?: number;
    identifierAttributes?: string[];
    enhanceOriginalQuery?: boolean;
  } = {}
): any {
  // Prüfe auf ungültige Eingaben
  if (!params || !query) {
    return params || {};
  }
  
  const {
    identifierPattern = /^[A-Za-z0-9-]+$/,
    minIdentifierLength = 5,
    identifierAttributes = ['skus', 'filename', 'external_skus'],
    enhanceOriginalQuery = false
  } = options;
  
  // Kopiere die Parameter, um sie nicht zu verändern
  const enhancedParams = { ...params };
  
  // Prüfe, ob die Suchanfrage wie ein Identifier aussieht
  if (query && isIdentifierQuery(query, identifierPattern, minIdentifierLength)) {
    // Erstelle einen erweiterten Filter für die Suche in Attributen
    const attributeFilter = createAttributeFilter(query, identifierAttributes);
    
    if (attributeFilter) {
      // Bei Identifier-Suche setzen wir die Volltextsuche zurück
      // und verwenden nur den Filter für die Attribute
      enhancedParams.query = enhanceOriginalQuery ? query : '';
      
      // Wenn bereits ein Filter gesetzt ist, kombiniere ihn mit dem erweiterten Filter
      if (enhancedParams.filter) {
        enhancedParams.filter = `(${enhancedParams.filter}) AND (${attributeFilter})`;
      } else {
        enhancedParams.filter = attributeFilter;
      }
      
      // Debug-Ausgabe für die Entwicklung
      if (process.env.NODE_ENV === 'development') {
        console.log('Attributsuche aktiviert:', {
          originalQuery: query,
          enhancedQuery: enhancedParams.query,
          filter: enhancedParams.filter
        });
      }
    }
  }
  
  return enhancedParams;
}
