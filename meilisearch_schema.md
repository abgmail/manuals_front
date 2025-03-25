# Meilisearch-Schema für Handbücher

## Dokumentenstruktur

### Basis-Attribute
- `filename` (string): Normalisierter Dateiname
- `download_url` (string): URL zum Herunterladen der PDF
- `document_id` (string): Eindeutige ID im Format `filename_page_number`
- `page_number` (number): Seitennummer innerhalb des PDFs
- `content` (string): Extrahierter Text der Seite

### Produkt-Metadaten
- `document_date` (string): Datum aus Dateinamen im Format YYYY-MM-DD
- `skus` (string[]): Liste der erkannten Artikelnummern (ohne Unterstriche am Ende)
- `external_skus` (string[]): Liste der erkannten externen Artikelnummern (E-Nummern)
- `tags` (string[]): Liste der Tags (z.B. "MSPA")

## Seitenweise Indizierung

Jede Seite eines PDFs wird als eigenständiges Dokument in Meilisearch indiziert. Dies bietet folgende Vorteile:

1. **Präzisere Suchergebnisse**: Nutzer werden direkt zur relevanten Seite geleitet
2. **Bessere Relevanz**: Meilisearch kann die Relevanz genauer bestimmen
3. **Seitenspezifische SKUs**: Wenn verfügbar, werden SKUs pro Seite zugeordnet
4. **Schnellere Ladezeiten**: Kleinere Textblöcke sind schneller zu verarbeiten

### Beispiel eines Dokuments
```json
{
  "filename": "2024_02_29_1004275001_BRB-RT-61224_Rasentraktor_MANUAL.pdf",
  "page_number": 3,
  "document_id": "2024_02_29_1004275001_BRB-RT-61224_Rasentraktor_MANUAL.pdf_3",
  "download_url": "https://example.com/manuals/2024_02_29_1004275001_BRB-RT-61224_Rasentraktor_MANUAL.pdf",
  "content": "Sicherheitshinweise...",
  "skus": ["1004275001"],
  "document_date": "2024-02-29",
  "tags": ["Rasentraktor", "BRAST"]
}
```

## Filterbare Attribute
Folgende Attribute sind für die Filterung optimiert:
- `skus`
- `document_date`
- `tags`
- `filename`

## Sortierbare Attribute
- `document_date`
- `page_number`

## Beispiel-Abfragen

### Produktsuche
```
# Nach Artikelnummer
skus:"1004266001"

# Nach Datum
document_date:"2024-02-29"

# Nach Tag
tags:"MSPA"
```

### Seitensuche
```
# Bestimmte Seite eines Dokuments
document_id:"2024_02_29_1004275001_BRB-RT-61224_Rasentraktor_MANUAL.pdf_3"

# Alle Seiten eines Dokuments
filename:"2024_02_29_1004275001_BRB-RT-61224_Rasentraktor_MANUAL.pdf"
```

### Volltext-Suche
```
# In Inhalt suchen
content:"Sicherheitshinweise"
```

## Verarbeitungspipeline

Die Verarbeitungspipeline besteht aus folgenden Schritten:

1. **PDF-Vorbereitung**:
   - Normalisierung der Dateinamen
   - Extraktion von SKUs und Metadaten

2. **Indexierung**:
   - Extraktion des Datums aus dem Dateinamen
   - Extraktion des Textes seitenweise
   - Speicherung in SQLite-Datenbank

3. **JSON-Export**:
   - Seitenweise Exportierung der Dokumente
   - Entfernung von lokalen Pfadinformationen
   - Entfernung von Unterstrichen am Ende der SKUs

4. **Meilisearch-Upload**:
   - Upload der JSON-Datei zu Meilisearch
   - Konfiguration der Suchattribute

## Next.js Integration

### Such-Interface
```typescript
// Basis-Suchfunktion
const sucheHandbuecher = async (query: string, filter?: string) => {
  return await meilisearch
    .index('manuals')
    .search(query, {
      filter,
      sort: ['document_date:desc'],
      facets: ['tags']
    });
};

// Seitenweise Navigation
const sucheSeiten = async (filename: string) => {
  return await meilisearch
    .index('manuals')
    .search('', {
      filter: `filename = "${filename}"`,
      sort: ['page_number:asc']
    });
};
