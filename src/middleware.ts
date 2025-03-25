import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Token aus der Umgebungsvariable
const ONLINE_TOKEN = process.env.ONLINE_TOKEN || 'hjh545rfdssdfuww87f87zggfeb';

// Pfade, die keinen Schutz benötigen
const publicPaths = [
  '/',
  '/access-denied',
];

/**
 * Middleware zur Überprüfung der Authentifizierung
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Prüfen, ob der Pfad öffentlich ist
  if (publicPaths.some(path => pathname === path)) {
    return NextResponse.next();
  }
  
  // Token aus der URL extrahieren, wenn es sich um einen Token-Pfad handelt
  const pathParts = pathname.split('/');
  if (pathParts.length >= 2) {
    const potentialToken = pathParts[1];
    
    // Direkter Zugriff über Token-Pfad
    if (potentialToken === ONLINE_TOKEN && pathname.endsWith('/search')) {
      // Token in Cookie setzen und Zugriff erlauben
      const response = NextResponse.next();
      response.cookies.set('auth_token', ONLINE_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 Stunden
        path: '/',
      });
      return response;
    }
  }
  
  // Prüfen, ob ein gültiges Auth-Token vorhanden ist
  const authToken = request.cookies.get('auth_token')?.value;
  
  if (!authToken || authToken !== ONLINE_TOKEN) {
    // Wenn kein Token vorhanden ist oder ungültig, zur Zugriffsverweigerungsseite weiterleiten
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }
  
  // Token ist vorhanden und gültig, Zugriff erlauben
  return NextResponse.next();
}

// Konfiguration für die Middleware
export const config = {
  // Matcher für alle Pfade außer statischen Assets und API-Routen
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
