import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';

interface HeaderProps {
  token: string;
  logoUrl?: string;
}

export default function Header({ token, logoUrl }: HeaderProps) {
  return (
    <header className="sticky-header">
      <div className="header-content">
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
    </header>
  );
}
