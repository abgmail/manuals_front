import { MeilisearchAPI, isIdentifierQuery, enhanceSearchParams as meilisearchEnhanceSearchParams } from './meilisearch-api';
import { SearchParams, SearchResult } from './meilisearch-api/types';

// Konfiguration für Meilisearch
const meilisearchClient = new MeilisearchAPI({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_KEY || '',
  defaultIndex: 'manuals',
  debug: process.env.NODE_ENV === 'development',
});

// Ausgabe der Konfiguration im Entwicklungsmodus
if (process.env.NODE_ENV === 'development') {
  console.log('Meilisearch Konfiguration:');
  console.log('- Host:', process.env.NEXT_PUBLIC_MEILISEARCH_HOST ? 'Definiert' : 'FEHLT');
  console.log('- API Key:', process.env.MEILISEARCH_KEY ? 'Definiert' : 'FEHLT');
  console.log('- Default Index: manuals');
}

/**
 * Bereinigt eine Suchanfrage von potenziell problematischen Zeichen
 * @param query Die Suchanfrage
 * @returns Bereinigte Suchanfrage
 */
function sanitizeQuery(query: string): string {
  if (!query) return '';
  
  // Entferne alle Zeichen, die in Meilisearch Probleme verursachen könnten
  // Behalte nur Buchstaben, Zahlen, Leerzeichen und einige grundlegende Sonderzeichen
  return query.replace(/[^\w\s\-\.]/g, '');
}

/**
 * Erstellt einen Filter für die Attributsuche
 * @param query Die Suchanfrage
 * @param attributes Die zu durchsuchenden Attribute
 * @returns Ein Filter-String für Meilisearch
 */
function createAttributeFilter(query: string, attributes: string[]): string {
  // Verfügbare filterbare Attribute in Meilisearch
  const filterableAttributes = ['document_date', 'filename', 'skus', 'tags'];
  
  // Nur die filterbaren Attribute verwenden
  const validAttributes = attributes.filter(attr => filterableAttributes.includes(attr));
  
  if (validAttributes.length === 0) {
    return '';
  }
  
  // Filter für jedes Attribut erstellen
  const filters = validAttributes.map(attr => `${attr} = "${query}"`);
  
  // Filter mit ODER verknüpfen
  return filters.join(' OR ');
}

/**
 * Führt eine intelligente Suche nach Handbüchern durch
 * @param query Suchanfrage
 * @param filter Optionaler Filter
 * @returns Suchergebnisse
 */
export async function searchManuals(query: string, filter?: string): Promise<SearchResult<any>> {
  try {
    // Bereinige die Suchanfrage
    const sanitizedQuery = sanitizeQuery(query);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Suchanfrage bereinigt:', {
        original: query,
        sanitized: sanitizedQuery
      });
    }
    
    // Basisparameter für die Suche
    const baseParams: SearchParams = {
      query: sanitizedQuery,
      filter,
      limit: 50,
      sort: ['document_date:desc'],
      facets: ['tags', 'skus'],
    };

    // Prüfen, ob die Anfrage ein Identifier ist (SKU, Artikelnummer, etc.)
    const isIdQuery = isIdentifierQuery(sanitizedQuery);

    // Suchparameter basierend auf dem Anfragentyp anpassen
    const searchParams = isIdQuery
      ? meilisearchEnhanceSearchParams(baseParams, sanitizedQuery, {
          identifierAttributes: ['skus', 'filename'],
          enhanceOriginalQuery: false,
        })
      : baseParams;

    if (process.env.NODE_ENV === 'development') {
      console.log('Suchanfrage:', {
        query: sanitizedQuery,
        isIdentifier: isIdQuery,
        filter,
        searchParams
      });
    }

    // Suche durchführen
    try {
      // Zuerst versuchen, mit den erweiterten Parametern zu suchen
      const results = await meilisearchClient.search(searchParams);
      
      // Wenn keine Ergebnisse gefunden wurden und es eine Attributsuche war,
      // versuchen wir es mit einer Volltextsuche
      if (results.hits.length === 0 && isIdQuery) {
        console.log('Keine Ergebnisse bei Attributsuche, versuche Volltextsuche');
        
        // Volltextsuche durchführen
        const fallbackParams: SearchParams = {
          query: sanitizedQuery,
          limit: 50,
          sort: ['document_date:desc'],
          facets: ['tags', 'skus'],
        };
        
        return await meilisearchClient.search(fallbackParams);
      }
      
      return results;
    } catch (searchError) {
      console.error('Fehler bei der Suche mit Parametern:', searchError);
      
      // Fallback: Versuche eine einfachere Suche ohne spezielle Parameter
      console.log('Versuche Fallback-Suche mit vereinfachten Parametern');
      const fallbackParams: SearchParams = {
        query: sanitizedQuery,
        limit: 50,
      };
      
      return await meilisearchClient.search(fallbackParams);
    }
  } catch (error) {
    console.error('Fehler bei der Suche:', error);
    
    // Detaillierte Fehlerinformationen im Entwicklungsmodus
    if (process.env.NODE_ENV === 'development') {
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
    
    // Leere Ergebnisse zurückgeben, anstatt einen Fehler zu werfen
    return {
      hits: [],
      query: query,
      processingTimeMs: 0,
      estimatedTotalHits: 0,
      facetDistribution: {},
      limit: 50,
      offset: 0
    };
  }
}

/**
 * Sucht nach allen Seiten eines bestimmten Dokuments
 * @param filename Dateiname des Dokuments
 * @returns Suchergebnisse mit allen Seiten
 */
export async function getDocumentPages(filename: string): Promise<SearchResult<any>> {
  try {
    const results = await meilisearchClient.search({
      query: '',
      filter: `filename = "${filename}"`,
      sort: ['page_number:asc'],
      limit: 100,
    });

    return results;
  } catch (error) {
    console.error('Fehler beim Abrufen der Dokumentseiten:', error);
    
    // Leere Ergebnisse zurückgeben, anstatt einen Fehler zu werfen
    return {
      hits: [],
      query: '',
      processingTimeMs: 0,
      estimatedTotalHits: 0,
      facetDistribution: {},
      limit: 100,
      offset: 0
    };
  }
}
