# Smarte Suche - Dokumentation

## Übersicht

Die Manuals-Anwendung verwendet eine intelligente Suchfunktion, die automatisch zwischen verschiedenen Suchmodi umschaltet, basierend auf der Eingabe des Benutzers. Dies verbessert die Benutzererfahrung, indem es die Komplexität der Suche reduziert und gleichzeitig präzise Ergebnisse liefert.

## Funktionsweise

### 1. Automatische Erkennung des Suchtyps

Die Anwendung erkennt automatisch, ob eine Eingabe eine SKU (Artikelnummer), eine PO (Bestellnummer) oder ein allgemeiner Suchbegriff ist:

- **SKU/PO-Erkennung**: Alphanumerische Zeichen mit Bindestrichen (z.B. "ABC-123", "21224")
- **Volltextsuche**: Alle anderen Eingaben

### 2. Intelligenter Suchalgorithmus

Wenn eine Eingabe als potenzielle SKU/PO erkannt wird:

1. **Attributsuche**: Die Anwendung sucht zuerst in spezifischen Attributen:
   - Exakte SKU-Übereinstimmung (`skus`)
   - Teilübereinstimmungen im Dateinamen (`filename`)
   - Modellnummern (`model_number`)
   - Artikelnummern (`article_number`)

2. **Fallback zur Volltextsuche**: Wenn keine Treffer in den Attributen gefunden werden, wird automatisch eine Volltextsuche durchgeführt.

### 3. Visuelles Feedback

- Der Benutzer erhält visuelles Feedback über den aktuellen Suchmodus durch ein Badge:
  - Grün: SKU/PO-Suche mit gefundenen Dokumenten
  - Blau: Volltextsuche wird verwendet

## Implementierungsdetails

### Frontend (SearchForm.tsx)

- Verwendet einen Debounce-Mechanismus, um die SKU/PO-Validierung während der Eingabe durchzuführen
- Zeigt dem Benutzer den aktuellen Suchmodus an
- Sendet die Suchanfrage an die API

### API (search/route.ts)

- Verarbeitet die Suchanfrage und bestimmt den Suchmodus
- Gruppiert die Ergebnisse bei SKU/PO-Suchen nach Dokumenten
- Gibt alle Ergebnisse bei Volltextsuchen zurück

### Suchlogik (search/page.tsx)

- Erweitert die Suche für SKU/PO-ähnliche Eingaben um verschiedene Attribute
- Kombiniert Filter mit bestehenden Filtern
- Behält die Volltextsuche bei, um auch Treffer im Inhalt zu finden

## Vorteile

1. **Vereinfachte Benutzeroberfläche**: Nur ein Suchfeld für alle Suchtypen
2. **Verbesserte Benutzererfahrung**: Automatische Anpassung an die Benutzereingabe
3. **Höhere Trefferquote**: Durch Kombination von Attribut- und Volltextsuche
4. **Flexibilität**: Funktioniert mit vollständigen SKUs, Teilnummern und Modellnummern

## Beispiele

- Eingabe "ABC-123" (existierende SKU): Zeigt alle Dokumente mit dieser SKU
- Eingabe "21224" (Teil einer SKU): Findet Dokumente, die diese Nummer im Dateinamen oder als Teil einer SKU enthalten
- Eingabe "Bedienungsanleitung": Führt eine Volltextsuche durch
