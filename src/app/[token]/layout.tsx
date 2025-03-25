import Header from '@/components/layout/Header';

export default function TokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  // Hier kann später die Logo-URL basierend auf dem Token oder aus einer Konfiguration geladen werden
  // Für jetzt verwenden wir einen Platzhalter
  const logoUrl = '/images/logo.svg'; // Platzhalter, kann später dynamisch sein

  return (
    <div className="min-h-screen flex flex-col">
      <Header token={params.token} logoUrl={logoUrl} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
