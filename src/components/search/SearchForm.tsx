"use client";

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Suche nach Artikelnummer, Modell oder Stichwort..."
            value={query}
            onChange={handleQueryChange}
            className="pr-10"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="absolute right-0 top-0 h-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button type="submit">Suchen</Button>
      </div>
      
      {isIdentifier !== null && (
        <div className="flex items-center gap-2">
          <Badge variant={isIdentifier ? "default" : "secondary"}>
            {isIdentifier ? "Attributsuche" : "Volltextsuche"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isIdentifier 
              ? "Suche nach exakten Übereinstimmungen in Attributen (SKU, Dateiname, etc.)" 
              : "Volltextsuche im gesamten Dokumenteninhalt"}
          </span>
        </div>
      )}
    </form>
  );
}
