"use client";

import { useEffect } from 'react';
import SearchForm from '@/components/search/SearchForm';
import SearchResults from '@/components/search/SearchResults';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SearchPageProps {
  searchParams: {
    q?: string;
    filter?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q, filter } = searchParams;

  useEffect(() => {
    document.title = q ? `Suche: ${q}` : 'Suche';
  }, [q]);

  return (
    <div className="container mx-auto py-6 px-4">
      {q && (
        <div className="results-container">
          <h1 className="text-3xl font-bold mb-4">Suchergebnisse für "{q}"</h1>
          <p className="text-lg font-semibold mb-2">50 Ergebnisse für "{q}"</p>
          <SearchResults query={q} filter={filter} />
        </div>
      )}

      {!q && (
        <>
          <Card className="text-center py-8 mb-8 bg-gray-100">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-lg">
                Geben Sie einen Suchbegriff ein, um Handbücher zu finden.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="p-6 bg-white shadow-md">
              <h2 className="text-xl font-semibold mb-4">Willkommen bei der Handbuch-Suche</h2>
              <p className="text-muted-foreground mb-4">
                Hier können Sie nach Handbüchern und technischen Dokumentationen suchen. 
                Verwenden Sie das Suchfeld oben, um Ihre Suche zu starten.
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Suchhinweise:</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Sie können nach Artikelnummern suchen</li>
                  <li>Freitextsuche nach Begriffen ist ebenfalls möglich</li>
                  <li>Nutzen Sie die Filter, um Ihre Ergebnisse einzugrenzen</li>
                </ul>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
