"use client";

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isIdentifierQuery } from '@/lib/meilisearch-api';
import { Loader2 } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  
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
    <form onSubmit={handleSubmit} className={`w-full ${compact ? 'max-w-full' : 'max-w-3xl mx-auto'}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
        <Input
          type="text"
          placeholder="Suchen Sie nach Handbüchern und Dokumentationen"
          value={query}
          onChange={handleQueryChange}
          className="pl-10 w-full h-14 text-base search-input rounded-lg border-input/50 focus:border-primary"
          disabled={isLoading}
          aria-label="Suchbegriff"
        />
        {isIdentifier !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge variant={isIdentifier ? "default" : "secondary"} className="text-xs badge">
              {isIdentifier ? "Artikelnummer" : "Freitext"}
            </Badge>
          </div>
        )}
      </div>
      
      <div className={`flex items-center gap-2 mt-5 ${compact ? 'justify-end' : 'justify-between'}`}>
        {!compact && (
          <button
            type="button"
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              borderRadius: "0.375rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              height: "2.5rem",
              width: "auto",
              backgroundColor: "white",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
              fontWeight: 500,
              textDecoration: "none",
              boxSizing: "border-box",
              transition: "all 0.2s ease"
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter</span>
          </button>
        )}
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading}
          style={{ 
            borderRadius: "0.375rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0 1.25rem",
            height: "2.5rem",
            width: "auto",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 500,
            textDecoration: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease"
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Suche...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Suchen</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
