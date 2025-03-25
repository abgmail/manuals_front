# Meilisearch API Komponente

## Übersicht

Die Meilisearch API Komponente ist eine wiederverwendbare, typsichere Bibliothek für die Interaktion mit Meilisearch in verschiedenen Projekten. Sie bietet eine einheitliche Schnittstelle für Suchoperationen, Dokumentenverwaltung und intelligente Suchfunktionen.

## Architektur

Die Komponente besteht aus mehreren Modulen:

### 1. Client (`client.ts`)

- **MeilisearchAPI-Klasse**: Hauptklasse für die Interaktion mit Meilisearch
- Bietet Methoden für:
  - Suche
  - Dokumente hinzufügen/aktualisieren/löschen
  - Dokumentenabfrage
  - Statistiken
  - Task-Management

### 2. Typen (`types.ts`)

- Definiert alle Typen für die API-Komponente
- Enthält Schnittstellen für:
  - Konfiguration
  - Suchparameter
  - Suchergebnisse
  - Dokumentenoperationen
  - Indexstatistiken
  - Task-Informationen

### 3. Utilities (`utils.ts`)

- Hilfsfunktionen für häufige Meilisearch-Operationen:
  - Gruppierung von Suchergebnissen
  - Erstellung von Filterstrings
  - Erkennung von Identifier-Abfragen
  - Intelligente Suchparameter-Erweiterung

## Intelligente Suche

Die Komponente unterstützt intelligente Suche mit folgenden Funktionen:

1. **Automatische Abfrageerkennung**:
   - Erkennt, ob eine Abfrage ein Identifier (SKU, Artikelnummer) oder Freitext ist
   - Passt die Suchstrategie entsprechend an

2. **Attributbasierte Suche**:
   - Sucht in spezifischen Attributen für Identifier-Abfragen
   - Unterstützt sowohl exakte Übereinstimmungen als auch Teil-Übereinstimmungen

3. **Ergebnisgruppierung**:
   - Gruppiert Suchergebnisse nach einem bestimmten Feld
   - Entfernt Duplikate basierend auf Prioritätsfeldern

## Verwendung

### Grundlegende Einrichtung

```typescript
import MeilisearchAPI from '@/lib/meilisearch-api';

const meilisearchClient = new MeilisearchAPI({
  host: process.env.MEILISEARCH_HOST || '',
  apiKey: process.env.MEILISEARCH_KEY || '',
  defaultIndex: 'your_index',
  debug: process.env.NODE_ENV === 'development'
});
```

### Intelligente Suche

```typescript
import { isIdentifierQuery, enhanceSearchParams } from '@/lib/meilisearch-api';

// Prüfe, ob die Suchanfrage ein Identifier ist
const isIdentifier = isIdentifierQuery(query);

// Erweitere die Suchparameter für intelligente Suche
const enhancedParams = isIdentifier 
  ? enhanceSearchParams(params, query, {
      identifierAttributes: ['skus', 'filename', 'model_number', 'article_number'],
      enhanceOriginalQuery: true
    })
  : params;

// Führe die Suche durch
const results = await meilisearchClient.search(enhancedParams);
```

### Ergebnisgruppierung

```typescript
import { groupResultsByField } from '@/lib/meilisearch-api';

// Gruppiere die Ergebnisse nach document_id
const groupedResults = groupResultsByField(
  results,
  'document_id',
  'page_number',
  'asc'
);
```

## Integration in die Anwendung

Die Komponente wurde in die bestehende Anwendung integriert:

1. **Meilisearch-Instance**: Eine konfigurierte Instanz der API für die Anwendung
2. **API-Route**: Verwendet die intelligente Suche für optimale Ergebnisse
3. **Suchseite**: Nutzt die erweiterten Suchfunktionen für bessere Benutzererfahrung

## Vorteile

1. **Wiederverwendbarkeit**: Kann in verschiedenen Projekten eingesetzt werden
2. **Typsicherheit**: Vollständige TypeScript-Unterstützung
3. **Fehlerbehandlung**: Eingebaute Fehlerbehandlung und Validierung
4. **Flexible Konfiguration**: Anpassbar für verschiedene Umgebungen
5. **Intelligente Suche**: Optimiert Suchabfragen automatisch
6. **Debug-Modus**: Optionale Debug-Protokollierung für die Entwicklung
