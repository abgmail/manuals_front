import SearchForm from '@/components/search/SearchForm';
import SearchResults from '@/components/search/SearchResults';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface SearchPageProps {
  searchParams: {
    q?: string;
    filter?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q, filter } = searchParams;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="search-header text-center mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Manuals Suchportal</h1>
          </div>
          <p>Suchen Sie nach Handbüchern und Dokumentationen</p>
        </div>
      </div>
      
      <div className="search-form-container">
        <SearchForm initialQuery={q || ''} />
      </div>
      
      {q && (
        <div className="results-container">
          <SearchResults query={q} filter={filter} />
        </div>
      )}
      
      {!q && (
        <Card className="text-center py-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Geben Sie einen Suchbegriff ein, um Handbücher zu finden.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
