import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Listar as URLs públicas que não devem exigir autenticação, incluindo tokens na query string
    const publicPaths = ['/nova_senha'];

    const pathname = req.nextUrl.pathname;

    // Permite o acesso a /nova_senha mesmo que tenha token na query string
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Adicione aqui a lógica de autenticação para outras rotas
    const token = req.cookies.get('auth-token');
    if (!token) {
        return NextResponse.redirect(new URL('/', req.url)); // Redireciona para a home se não autenticado
    }

    return NextResponse.next(); // Permite o acesso às rotas autenticadas
}

export const config = {
    matcher: ['/nova_senha'], // Especifique as rotas que devem passar pelo middleware
};

