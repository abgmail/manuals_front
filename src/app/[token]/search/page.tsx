import SearchForm from '@/components/search/SearchForm';
import SearchResults from '@/components/search/SearchResults';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="search-form-container mb-8">
        <SearchForm initialQuery={q || ''} />
      </div>
      
      {q && (
        <div className="results-container">
          <SearchResults query={q} filter={filter} />
        </div>
      )}
      
      {!q && (
        <>
          <Card className="text-center py-8 mb-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Geben Sie einen Suchbegriff ein, um Handbücher zu finden.
              </p>
            </CardContent>
          </Card>
          
          {/* Zusätzlicher Inhalt zum Testen des sticky Headers */}
          <div className="space-y-8">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="p-6">
                <h2 className="text-xl font-semibold mb-4">Beispielinhalt {index + 1}</h2>
                <p className="text-muted-foreground mb-4">
                  Dieser Inhalt dient dazu, das Sticky-Verhalten des Headers zu testen. 
                  Beim Scrollen sollte der Header oben am Bildschirm haften bleiben.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget
                  aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
                  Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
