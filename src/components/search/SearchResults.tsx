"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, FileText, AlertCircle, Clock, Search } from 'lucide-react';
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
      
      <div className="overflow-x-auto">
        <Table className="results-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Dokument</TableHead>
              <TableHead>Seite</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>SKUs</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.hits.map((hit: any) => (
              <TableRow key={hit.document_id || hit.id || hit._id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {hit.filename}
                </TableCell>
                <TableCell>{hit.page_number}</TableCell>
                <TableCell>{hit.document_date}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(hit.skus) ? hit.skus.map((sku: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sku}
                      </Badge>
                    )) : (
                      hit.skus && <Badge variant="outline" className="text-xs">{hit.skus}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="action-button">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:inline-block">Vorschau</span>
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
                    
                    <DownloadButton 
                      url={`${process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL}/download/${hit.filename}`} 
                      filename={hit.filename} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Komponente für den Download-Button mit Kopier-Funktion
function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="relative">
      <Button variant="default" size="sm" asChild className="action-button">
        <a href={url} download target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:inline-block">Download</span>
        </a>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-muted hover:bg-muted-foreground hover:text-muted"
        onClick={copyToClipboard}
      >
        <Copy className="h-3 w-3" />
        <span className="sr-only">Link kopieren</span>
      </Button>
      
      {copied && (
        <div className="absolute -top-8 right-0 bg-muted-foreground text-muted text-xs py-1 px-2 rounded">
          Link kopiert!
        </div>
      )}
    </div>
  );
}
