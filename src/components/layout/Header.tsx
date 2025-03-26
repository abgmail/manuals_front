"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import SearchForm from '@/components/search/SearchForm';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

interface HeaderProps {
  token: string;
  logoUrl?: string;
}

export default function Header({ token, logoUrl }: HeaderProps) {
  // Client-Komponente kann useSearchParams verwenden
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  return (
    <div className="sticky-header">
      <div className="header-content">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="mr-4">
              <Image
                src={logoUrl}
                alt="Logo"
                width={120}
                height={60}
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
          )}
          
          <div className="flex flex-col">
            <Link href={`/${token}/search`} className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              Manuals Suchportal
            </Link>
            <p className="text-sm text-muted-foreground">
              Handbücher und Dokumentationen
            </p>
          </div>
        </div>
      </div>
      
      <div className="container py-6 bg-gradient-to-b from-background to-muted/30">
        <Card className="bg-card shadow-lg border-primary/10 overflow-hidden">
          <CardContent className="p-6">
            <SearchForm initialQuery={initialQuery} compact={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
