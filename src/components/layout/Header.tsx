"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import SearchForm from '@/components/search/SearchForm';
import { useSearchParams } from 'next/navigation';

interface HeaderProps {
  token: string;
  logoUrl?: string;
}

export default function Header({ token, logoUrl }: HeaderProps) {
  // Client-Komponente kann useSearchParams verwenden
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  return (
    <div className="sticky-header-container">
      <header className="sticky-header">
        <div className="header-content">
          <div className="flex items-center">
            {logoUrl ? (
              <div className="logo-container">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  height={60}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            ) : (
              <FileText className="h-8 w-8" />
            )}
            
            <div className="header-text">
              <Link href={`/${token}/search`} className="header-title">
                Manuals Suchportal
              </Link>
              <p className="header-subtitle">
                Suchen Sie nach Handbüchern und Dokumentationen
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="search-bar">
        <SearchForm initialQuery={initialQuery} compact={false} />
      </div>
    </div>
  );
}
