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
    <div>
      <h2 className="text-2xl font-bold mb-6">{results.length} Ergebnisse für "{query}"</h2>
      
      <div className="space-y-4">
        {results.map((hit) => (
          <Card key={hit.document_id || hit.id || hit._id} className="overflow-hidden border border-muted">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium line-clamp-1">{hit.filename}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seitenanzahl:</span> 
                      <span className="font-medium ml-1">{hit.page_number}</span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Datum:</span> 
                      <span className="font-medium ml-1">{formatDate(hit.document_date)}</span>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-muted-foreground">SKUs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-border">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Vorschau
                  </a>
                </Button>
                
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
                
                <CopyLinkButton 
                  url={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/${hit.filename}`} 
                />
              </div>
            </div>
          </Card>
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
      className="w-full" 
      onClick={copyToClipboard}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Kopiert
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Link kopieren
        </>
      )}
    </Button>
  );
}
