"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, FileText, AlertCircle, Clock, Search, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchResultsProps {
  query: string;
  filter?: string;
}

export default function SearchResults({ query, filter }: SearchResultsProps) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Fehler bei der Suche');
        }
        
        const data = await response.json();
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Fehler bei der Suche:', err);
        setError('Bei der Suche ist ein Fehler aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, filter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Suchergebnisse werden geladen...</p>
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

  if (!results || results.hits.length === 0) {
    return (
      <Card className="my-4 border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Ergebnisse gefunden</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Keine Ergebnisse gefunden für &quot;{query}&quot;. Bitte versuchen Sie eine andere Suchanfrage oder prüfen Sie die Schreibweise.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="results-header">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-sm">
            {results.hits.length}
          </span>
          Ergebnisse für &quot;{query}&quot;
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Suchdauer: {results.processingTimeMs}ms</span>
        </div>
      </div>
      
      <div className="grid gap-4">
        {results.hits.map((hit: any) => (
          <Card key={hit.document_id || hit.id || hit._id} className="overflow-hidden border border-muted">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium line-clamp-1">{hit.filename}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Seite:</span> 
                      <span className="font-medium ml-1">{hit.page_number}</span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Datum:</span> 
                      <span className="font-medium ml-1">{hit.document_date}</span>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Vorschau
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{hit.filename}</DialogTitle>
                      <DialogDescription>
                        Seite {hit.page_number} | Datum: {hit.document_date}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <iframe 
                        src={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/preview/${hit.filename}`} 
                        className="w-full h-[70vh] border rounded"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/download/${hit.filename}`} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
                
                <CopyLinkButton 
                  url={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/download/${hit.filename}`} 
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
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full"
      onClick={copyToClipboard}
    >
      {copied ? (
        <>
          <span className="text-green-600 text-xs">Link kopiert!</span>
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
