"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Suche läuft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Keine Ergebnisse gefunden</h3>
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
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Seiten:</span> 
                  <span className="font-medium ml-1">{hit.page_number}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Datum:</span> 
                  <span className="font-medium ml-1">{formatDate(hit.document_date)}</span>
                </div>
              </div>
              
              <div className="result-card-meta">
                {Array.isArray(hit.skus) && hit.skus.length > 0 ? hit.skus.map((sku: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sku}
                  </Badge>
                )) : hit.skus ? (
                  <Badge variant="outline" className="text-xs">{hit.skus}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>
            
            <div className="result-card-content">
              {hit.tags && Array.isArray(hit.tags) && hit.tags.length > 0 && (
                <div className="mb-2">
                  {hit.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 flex flex-row md:flex-col justify-end gap-2 border-t">
              <Button variant="outline" size="sm" className="w-full flex items-center gap-2" asChild>
                <a 
                  href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Vorschau</span>
                </a>
              </Button>
              
              <Button variant="default" size="sm" className="w-full flex items-center gap-2" asChild>
                <a 
                  href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              </Button>
              
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
      console.error('Fehler beim Kopieren in die Zwischenablage:', err);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full flex items-center gap-2" 
      onClick={copyToClipboard}
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
    </Button>
  );
}
