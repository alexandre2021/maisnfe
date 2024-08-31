import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Listar as URLs públicas que não devem exigir autenticação mesmo tendo o token
    const publicPaths = ['/nova_senha'];

    // Verificar se a URL atual é uma das URLs públicas
    const pathname = req.nextUrl.pathname;
    if (publicPaths.some(path => pathname.startsWith(path))) {
        // Permite o acesso à URL pública
        return NextResponse.next(); 
    }

    // Adicione sua lógica de autenticação aqui para outras rotas
    const token = req.cookies.get('auth-token');
    if (!token) {
        return NextResponse.redirect(new URL('/', req.url)); // Redireciona para a home se não autenticado
    }

    return NextResponse.next(); // Permite o acesso às rotas autenticadas
}

export const config = {
    matcher: ['/nova_senha'], // Especifique as rotas que devem passar pelo middleware
};
