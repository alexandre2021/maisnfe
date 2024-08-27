import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase/client';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Verificar se o e-mail está presente
        if (!email) {
            return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
        }

        // O redirecionamento agora aponta para a página correta de nova senha
        const redirectUrl = 'https://seusite.com/nova_senha';

        // Enviar o e-mail de recuperação de senha
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'E-mail de recuperação de senha enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação de senha:', error);
        return NextResponse.json({ error: 'Erro no servidor. Tente novamente mais tarde.' }, { status: 500 });
    }
}

