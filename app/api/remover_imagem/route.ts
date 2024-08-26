import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/server';

export async function POST(request: Request) {
    try {
        // Obtém os dados enviados na requisição
        const { imagePath } = await request.json();

        if (!imagePath) {
            return NextResponse.json({ error: 'Path da imagem não foi fornecido.' }, { status: 400 });
        }

        // Remove a imagem do bucket Supabase
        const { error } = await supabaseAdmin.storage
            .from('profiles')
            .remove([imagePath]);

        if (error) {
            return NextResponse.json({ error: `Erro ao remover a imagem: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Erro ao remover imagem:', error);
        return NextResponse.json({ error: 'Erro inesperado ao tentar remover a imagem.' }, { status: 500 });
    }
}
