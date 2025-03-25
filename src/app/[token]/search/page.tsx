import SearchForm from '@/components/search/SearchForm';
import SearchResults from '@/components/search/SearchResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchPageProps {
  searchParams: {
    q?: string;
    filter?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q, filter } = searchParams;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manuals Suchportal</CardTitle>
          <CardDescription>
            Suchen Sie nach Handbüchern und Dokumentationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm initialQuery={q || ''} />
        </CardContent>
      </Card>
      
      {q && <SearchResults query={q} filter={filter} />}
      
      {!q && (
        <div className="text-center py-8 text-muted-foreground">
          Geben Sie einen Suchbegriff ein, um Handbücher zu finden.
        </div>
      )}
    </div>
  );
}
