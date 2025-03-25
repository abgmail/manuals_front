"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, FileText, AlertCircle } from 'lucide-react';
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
    return <div className="text-center py-8">Suchergebnisse werden geladen...</div>;
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
      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Keine Ergebnisse gefunden für &quot;{query}&quot;. Bitte versuchen Sie eine andere Suchanfrage.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {results.hits.length} Ergebnisse für &quot;{query}&quot;
        </h2>
        <div className="text-sm text-muted-foreground">
          Suchdauer: {results.processingTimeMs}ms
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dokument</TableHead>
            <TableHead>Seite</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>SKUs</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.hits.map((hit: any) => (
            <TableRow key={hit.document_id || hit.id || hit._id}>
              <TableCell className="font-medium">
                {hit.filename}
              </TableCell>
              <TableCell>{hit.page_number}</TableCell>
              <TableCell>{hit.document_date}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {hit.skus?.map((sku: string) => (
                    <Badge key={sku} variant="outline">{sku}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Vorschau
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{hit.filename}</DialogTitle>
                        <DialogDescription>Seite {hit.page_number}</DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-auto p-4 border rounded-md bg-muted/50">
                        <p className="whitespace-pre-line">{hit.content}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <DownloadButton url={hit.download_url} filename={hit.filename} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Komponente für den Download-Button mit Kopier-Funktion
function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .catch(err => console.error('Fehler beim Kopieren der URL:', err));
  };
  
  return (
    <div className="flex items-center gap-1">
      <Button variant="default" size="sm" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer" download>
          <Download className="mr-2 h-4 w-4" />
          Download
        </a>
      </Button>
      <Button variant="ghost" size="sm" onClick={copyToClipboard}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
