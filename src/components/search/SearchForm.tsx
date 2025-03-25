"use client";

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { isIdentifierQuery } from '@/lib/meilisearch-api';

interface SearchFormProps {
  initialQuery: string;
  compact?: boolean;
}

export default function SearchForm({ initialQuery, compact = false }: SearchFormProps) {
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
    
    if (query.trim() === '') {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Wenn die Attributsuche aktiviert ist, fügen wir den Parameter hinzu
      const searchParams = new URLSearchParams();
      searchParams.set('q', query);
      
      if (isIdentifier) {
        searchParams.set('attributeSearch', 'true');
      }
      
      // Router-Navigation mit den Suchparametern
      // Extrahiere den Token aus dem aktuellen Pfad
      const token = window.location.pathname.split('/')[1];
      const path = `/${token}/search?${searchParams.toString()}`;
      await router.push(path);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? 'compact-search' : ''}`}>
      <div className="relative">
        <Search className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Suchen Sie nach Handbüchern und Dokumentationen"
          value={query}
          onChange={handleQueryChange}
          className="pl-10 w-full"
          disabled={isLoading}
          aria-label="Suchbegriff"
        />
        {isIdentifier !== null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant={isIdentifier ? "default" : "secondary"} className="text-xs font-medium">
              {isIdentifier ? "Artikelnummer" : "Freitext"}
            </Badge>
          </div>
        )}
      </div>
      
      <div className={`flex items-center ${compact ? 'mt-2' : 'mt-4'} ${compact ? 'justify-end' : 'justify-between'}`}>
        {!compact && (
          <Button variant="outline" type="button" className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className={`${compact ? 'w-auto' : 'px-6'}`}
        >
          {isLoading ? 'Suche...' : 'Suchen'}
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </form>
  );
}
