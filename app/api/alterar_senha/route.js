import { supabaseAdmin } from '../../utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email, novaSenha } = await req.json();

        console.log('Dados recebidos pela API:', { email, novaSenha });

        if (!email || !novaSenha) {
            return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
        }

        // Busca o usuário pelo email
        const { data: user, error: userError } = await supabaseAdmin.auth.api.getUserByEmail(email);

        if (userError || !user) {
            console.log('Erro ao buscar usuário:', userError ? userError.message : 'Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const userId = user.id;

        // Atualiza a senha do usuário
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: novaSenha,
        });

        if (updateError) {
            console.log('Erro ao atualizar a senha:', updateError.message);
            return NextResponse.json({ error: 'Erro ao atualizar a senha' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Senha atualizada com sucesso' });

    } catch (error) {
        console.log('Erro interno no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}