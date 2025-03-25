import { NextRequest, NextResponse } from 'next/server';
import { searchManuals } from '@/lib/search-service';

/**
 * API-Route für die Suche nach Handbüchern
 * @param request Request-Objekt
 * @returns Response mit Suchergebnissen
 */
export async function GET(request: NextRequest) {
  try {
    // URL-Parameter extrahieren
    const searchParams = request.nextUrl.searchParams;
    
    // Unterstütze sowohl 'query' als auch 'q' als Parameter für die Suchanfrage
    const query = searchParams.get('query') || searchParams.get('q') || '';
    const attributeSearch = searchParams.get('attributeSearch') === 'true';
    
    // Debug-Ausgaben für die Entwicklung
    if (process.env.NODE_ENV === 'development') {
      console.log('API-Anfrage erhalten:', {
        query,
        attributeSearch,
        params: Object.fromEntries(searchParams.entries())
      });
    }
    
    // Suchfilter basierend auf den Parametern erstellen
    let filter: string | undefined = undefined;
    
    // Wenn attributeSearch=true, verwenden wir den query-Parameter als SKU für die Attributsuche
    if (attributeSearch && query) {
      // Wir suchen nach exakten Übereinstimmungen in den Attributen
      // Nur die verfügbaren filterbaren Attribute verwenden: document_date, filename, skus, tags
      filter = `skus = "${query}" OR filename = "${query}"`;
      
      // Bei Attributsuche setzen wir die Volltextsuche zurück
      const results = await searchManuals('', filter);
      return NextResponse.json(results);
    }
    
    // Standardsuche durchführen
    const results = await searchManuals(query, filter);
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('API-Fehler bei der Suche:', error);
    
    // Fehlerantwort zurückgeben
    return NextResponse.json(
      { error: 'Bei der Suche ist ein Fehler aufgetreten' },
      { status: 500 }
    );
  }
}
