import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase/client';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Verificar se o e-mail foi fornecido
        if (!email) {
            return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
        }

        // Verificar se o usuário existe e se o e-mail já foi verificado
        const { data: user, error: userError } = await supabase
            .from('auth.users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        if (user.confirmed_at) {
            return NextResponse.json({ error: 'E-mail já foi confirmado.' }, { status: 400 });
        }

        // Modificar temporariamente o e-mail para acionar um novo envio de verificação
        const temporaryEmail = `${email}+temp@yourdomain.com`;

        const { error: updateError1 } = await supabase.auth.updateUser({
            email: temporaryEmail,
        });

        if (updateError1) {
            return NextResponse.json({ error: 'Erro ao atualizar o e-mail temporariamente.' }, { status: 500 });
        }

        // Atualizar de volta para o e-mail original
        const { error: updateError2 } = await supabase.auth.updateUser({
            email: email,
        });

        if (updateError2) {
            return NextResponse.json({ error: 'Erro ao atualizar o e-mail de volta ao original.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'E-mail de verificação reenviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao reenviar e-mail de verificação:', error);
        return NextResponse.json({ error: 'Erro no servidor. Tente novamente mais tarde.' }, { status: 500 });
    }
}
