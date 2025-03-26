"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, FileText, AlertCircle, Clock, Search, ExternalLink, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchResultsProps {
  query: string;
  filter?: string;
}

// Funktion zum Formatieren des Datums in deutsches Format (TT.MM.YYYY)
function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    // Fallback für den Fall, dass das Datum nicht geparst werden kann
    return dateString;
  }
}

export default function SearchResults({ query, filter }: SearchResultsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalHits, setTotalHits] = useState(0);

  // Suche ausführen, wenn die Komponente geladen wird
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        params.append('q', query);
        if (filter) {
          params.append('filter', filter);
        }
        
        const response = await fetch(`/api/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Fehler bei der Suche: ${response.statusText}`);
        }
        
        const data = await response.json();
        setResults(data.hits || []);
        setTotalHits(data.totalHits || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Suche');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (query) {
      fetchResults();
    }
  }, [query, filter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-10 w-10 animate-spin text-primary/70" />
          <p className="text-muted-foreground font-medium">Suche läuft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6 max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">{error}</AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <Search className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-70" />
        <h3 className="text-xl font-semibold mb-3">Keine Ergebnisse gefunden</h3>
        <p className="text-muted-foreground">
          Versuchen Sie es mit einem anderen Suchbegriff oder weniger Filtern.
        </p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="search-header">
        <h1>{results.length} Ergebnisse für "{query}"</h1>
        <p>Gefundene Dokumente, sortiert nach Datum (neueste zuerst)</p>
      </div>
      
      <div className="results-grid">
        {results.map((hit) => (
          <div key={hit.document_id || hit.id || hit._id} className="result-card">
            <div className="result-card-header">
              <h3 className="result-card-title">{hit.filename}</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground">Seiten:</span> 
                  <span className="font-medium ml-1">{hit.page_number}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-muted-foreground">Datum:</span> 
                  <span className="font-medium ml-1">{formatDate(hit.document_date)}</span>
                </div>
              </div>
              
              <div className="result-card-meta">
                {Array.isArray(hit.skus) && hit.skus.length > 0 ? hit.skus.map((sku: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs badge">
                    {sku}
                  </Badge>
                )) : hit.skus ? (
                  <Badge variant="outline" className="text-xs badge">{hit.skus}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
            
            <div className="result-card-content">
              {hit.tags && Array.isArray(hit.tags) && hit.tags.length > 0 && (
                <div className="mb-2">
                  {hit.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1 badge">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 flex flex-row md:flex-col justify-end gap-2 border-t">
              <a 
                href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-button"
                style={{ 
                  borderRadius: "0.375rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  height: "2.5rem",
                  width: "100%",
                  backgroundColor: "white",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                  fontWeight: 500,
                  textDecoration: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease"
                }}
              >
                <FileText className="h-4 w-4" />
                <span>Vorschau</span>
              </a>
              
              <a 
                href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-button"
                style={{ 
                  borderRadius: "0.375rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  height: "2.5rem",
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  fontWeight: 500,
                  textDecoration: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease"
                }}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
              
              <CopyLinkButton 
                url={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Komponente für den Kopier-Button
function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };
  
  return (
    <button 
      className={`copy-button ${copied ? 'copied' : ''}`}
      onClick={copyToClipboard}
      type="button"
      aria-label={copied ? "Link wurde kopiert" : "Link kopieren"}
      style={{ 
        borderRadius: "0.375rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        height: "2.5rem",
        width: "100%",
        backgroundColor: "white",
        color: copied ? "rgb(22, 163, 74)" : "#1f2937",
        border: copied ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid #e5e7eb",
        fontWeight: 500,
        textDecoration: "none",
        boxSizing: "border-box",
        transition: "all 0.2s ease"
      }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Kopiert</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Link kopieren</span>
        </>
      )}
    </button>
  );
}
