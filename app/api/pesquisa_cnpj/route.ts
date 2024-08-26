import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase/client';

let lastRequestTime: number | null = null;

async function waitIfNeeded() {
    if (lastRequestTime) {
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        if (timeSinceLastRequest < 20000) {
            await new Promise(resolve => setTimeout(resolve, 20000 - timeSinceLastRequest));
        }
    }
    lastRequestTime = Date.now();
}

export async function POST(req: NextRequest) {
    let { cnpj, nome, email } = await req.json();

    // Remove pontos, barras e traços do CNPJ
    cnpj = cnpj.replace(/[^\d]+/g, '');
    console.log("CNPJ formatado:", cnpj);

    const apiUrl = `https://publica.cnpj.ws/cnpj/${cnpj}`;

    try {
        await waitIfNeeded(); // Espera se necessário para respeitar o limite de 3 consultas por minuto

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        let empresaData;

        if (!response.ok) {
            if (response.status === 400 || response.status === 404 || response.status === 403 || response.status === 429 || response.status >= 500) {
                // Insere apenas o CNPJ na tabela empresas
                const { data: empresa, error: empresaError } = await supabase
                    .from('empresas')
                    .insert([{ cnpj }])
                    .select()
                    .single();

                if (empresaError) {
                    console.error("Erro ao registrar a empresa com apenas o CNPJ:", empresaError);
                    return NextResponse.json({ error: 'Erro ao registrar a empresa com apenas o CNPJ.' }, { status: 500 });
                }

                console.log("Empresa criada com apenas o CNPJ:", empresa);
                empresaData = { id: empresa.id, cnpj }; // Guarda o ID da empresa criada
            }
        } else {
            const data = await response.json();
            console.log("Dados da API:", data);

            // Insere todos os dados da empresa na tabela empresas
            const { data: empresa, error: empresaError } = await supabase
                .from('empresas')
                .insert([{
                    razao_social: data.razao_social,
                    cnpj: data.estabelecimento.cnpj,
                    logradouro: data.estabelecimento.logradouro,
                    numero: data.estabelecimento.numero,
                    complemento: data.estabelecimento.complemento,
                    bairro: data.estabelecimento.bairro,
                    cidade: data.estabelecimento.cidade.nome,
                    estado: data.estabelecimento.estado.sigla,
                    cep: data.estabelecimento.cep,
                    telefone: data.estabelecimento.telefone1 || '',
                    natureza_juridica: data.natureza_juridica.descricao,
                    simples_nacional: data.simples.simples === 'Sim',
                    mei: data.simples.mei === 'Sim',
                    atividade_principal: data.estabelecimento.atividade_principal.descricao,
                    atividades_secundarias: data.estabelecimento.atividades_secundarias,
                    porte_da_empresa: data.porte.descricao,
                    inscricao_estadual: data.estabelecimento.inscricoes_estaduais.length > 0 ? data.estabelecimento.inscricoes_estaduais[0].numero : null
                }])
                .select()
                .single();

            if (empresaError) {
                console.error("Erro ao registrar a empresa com dados completos:", empresaError);
                return NextResponse.json({ error: 'Erro ao registrar a empresa com dados completos.' }, { status: 500 });
            }

            console.log("Empresa criada com dados completos:", empresa);
            empresaData = empresa; // Guarda os dados da empresa criada
        }

        // Cria o usuário na tabela usuarios
        const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .insert([{
                nome,
                email,
                empresa_id: empresaData.id,
                administrador: true,
                avatar: nome.charAt(0), // Uso do Letter Avatar
            }])
            .select('id')
            .single();

        if (usuarioError) {
            console.error("Erro ao registrar o usuário:", usuarioError);
            return NextResponse.json({ error: 'Erro ao registrar o usuário.' }, { status: 500 });
        }

        console.log("Usuário criado:", usuarioData);

        // Atualiza a tabela empresas com o ID do usuário
        const { error: updateEmpresaError } = await supabase
            .from('empresas')
            .update({ usuarios_id: usuarioData?.id })
            .eq('id', empresaData.id);

        if (updateEmpresaError) {
            console.error("Erro ao associar o usuário à empresa:", updateEmpresaError);
            return NextResponse.json({ error: 'Erro ao associar o usuário à empresa.' }, { status: 500 });
        }

        console.log("Empresa atualizada com o ID do usuário");

        // Exclui a linha da tabela pesquisa_cnpj onde o email é igual ao email de autenticação
        const { error: deleteError } = await supabase
            .from('pesquisa_cnpj')
            .delete()
            .eq('email', email);   // Usa o email extraído da requisição

        if (deleteError) {
            console.error("Erro ao excluir o registro na tabela pesquisa_cnpj:", deleteError);
            return NextResponse.json({ error: 'Erro ao excluir o registro na tabela pesquisa_cnpj.' }, { status: 500 });
        }

        console.log("Registro excluído da tabela pesquisa_cnpj");
        return NextResponse.json({ success: 'Usuário e empresa criados com sucesso.' });


    } catch (error) {
        console.error('Erro inesperado:', error);
        return NextResponse.json({ error: 'Erro ao conectar com a API. Tente novamente mais tarde.' }, { status: 500 });
    }
}



