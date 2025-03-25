"use client";

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { isIdentifierQuery } from '@/lib/meilisearch-api';

interface SearchFormProps {
  initialQuery: string;
}

export default function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isIdentifier, setIsIdentifier] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce-Funktion für die Identifikation des Suchtyps
  const checkQueryType = useCallback((value: string) => {
    if (value.trim() === '') {
      setIsIdentifier(null);
      return;
    }
    
    const isIdQuery = isIdentifierQuery(value);
    setIsIdentifier(isIdQuery);
  }, []);
  
  // Handler für Änderungen im Suchfeld
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    checkQueryType(value);
  };
  
  // Handler für das Absenden des Formulars
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Wenn die Attributsuche aktiviert ist, fügen wir den Parameter hinzu
      const searchParams = new URLSearchParams();
      searchParams.set('q', query);
      
      if (isIdentifier) {
        searchParams.set('attributeSearch', 'true');
      }
      
      // Router-Navigation mit den Suchparametern
      const path = `/${window.location.pathname.split('/')[1]}/search?${searchParams.toString()}`;
      await router.push(path);
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
      setError('Bei der Suche ist ein Fehler aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Suche nach Artikelnummer, Modell oder Stichwort..."
              value={query}
              onChange={handleQueryChange}
              className="pl-10 pr-4 py-2 h-11 w-full"
              disabled={isLoading}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <Button 
            type="submit" 
            className="h-11 px-6"
            disabled={isLoading}
          >
            {isLoading ? 'Suche läuft...' : 'Suchen'}
          </Button>
        </div>
        
        {isIdentifier !== null && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-muted rounded-md">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Badge variant={isIdentifier ? "default" : "secondary"} className="search-badge">
              {isIdentifier ? "Attributsuche" : "Volltextsuche"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isIdentifier 
                ? "Suche nach exakten Übereinstimmungen in Attributen (SKU, Dateiname, etc.)" 
                : "Volltextsuche im gesamten Dokumenteninhalt"}
            </span>
          </div>
        )}
        
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
