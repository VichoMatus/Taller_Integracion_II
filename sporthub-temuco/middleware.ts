import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Eliminar TODOS los headers de seguridad que bloquean Google OAuth
  response.headers.delete('Cross-Origin-Opener-Policy');
  response.headers.delete('Cross-Origin-Embedder-Policy');
  response.headers.delete('Cross-Origin-Resource-Policy');
  
  // Establecer headers explícitamente en undefined/unsafe
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
