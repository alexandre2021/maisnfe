'use client';

import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import CustomModal from '../componentes/modal';
import Avatar from '@mui/material/Avatar';

// Reintroduzindo as variáveis de controle de tempo
let lastRequestTimeCnpja: number | null = null;
let lastRequestTimeCnpjws: number | null = null;

async function waitIfNeeded(apiType: 'cnpja' | 'cnpjws') {
    const lastRequestTime = apiType === 'cnpja' ? lastRequestTimeCnpja : lastRequestTimeCnpjws;
    const waitTime = apiType === 'cnpja' ? 12000 : 20000;

    if (lastRequestTime) {
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        if (timeSinceLastRequest < waitTime) {
            await new Promise(resolve => setTimeout(resolve, waitTime - timeSinceLastRequest));
        }
    }

    if (apiType === 'cnpja') {
        lastRequestTimeCnpja = Date.now();
    } else {
        lastRequestTimeCnpjws = Date.now();
    }
}

async function fetchCNPJFromCnpja(cnpj: string) {
    await waitIfNeeded('cnpja');
    const apiUrl = `https://api.cnpja.com/open/${cnpj}`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (response.ok) {
        return await response.json();
    }

    return null;
}

async function fetchCNPJFromCnpjws(cnpj: string) {
    await waitIfNeeded('cnpjws');
    const apiUrl = `https://publica.cnpj.ws/cnpj/${cnpj}`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (response.ok) {
        return await response.json();
    }

    return null;
}

async function processCNPJData(email: string, nome: string, cnpj: string) {
    const formattedCnpj = cnpj.replace(/[^\d]+/g, ''); // Formata o CNPJ
    let empresaData;

    // Tentar buscar os dados na API cnpja
    try {
        const dataCnpja = await fetchCNPJFromCnpja(formattedCnpj);

        if (dataCnpja) {
            empresaData = {
                razao_social: dataCnpja.company.name,
                cnpj: dataCnpja.taxId,
                logradouro: dataCnpja.address.street,
                numero: dataCnpja.address.number,
                complemento: dataCnpja.address.details,
                bairro: dataCnpja.address.district,
                cidade: dataCnpja.address.city,
                estado: dataCnpja.address.state,
                cep: dataCnpja.address.zip,
                telefone: dataCnpja.phones.length > 0 ? dataCnpja.phones[0].number : '',
                natureza_juridica: dataCnpja.company.nature.text,
                simples_nacional: dataCnpja.company.simples.optant,
                mei: dataCnpja.company.simei.optant,
                atividade_principal: dataCnpja.mainActivity.text,
                atividades_secundarias: dataCnpja.sideActivities.map((activity: { text: string }) => activity.text),
                porte_da_empresa: dataCnpja.company.size.text,
                inscricao_estadual: dataCnpja.registrations.length > 0 ? dataCnpja.registrations[0].number : null,
            };
        }
    } catch (error) {
        console.error('Erro ao conectar à API cnpja:', error);
    }

    // Se não conseguiu buscar dados na cnpja, tentar a API cnpj.ws
    if (!empresaData) {
        try {
            const dataCnpjws = await fetchCNPJFromCnpjws(formattedCnpj);

            if (dataCnpjws) {
                empresaData = {
                    razao_social: dataCnpjws.razao_social,
                    cnpj: dataCnpjws.estabelecimento.cnpj,
                    logradouro: dataCnpjws.estabelecimento.logradouro,
                    numero: dataCnpjws.estabelecimento.numero,
                    complemento: dataCnpjws.estabelecimento.complemento,
                    bairro: dataCnpjws.estabelecimento.bairro,
                    cidade: dataCnpjws.estabelecimento.cidade.nome,
                    estado: dataCnpjws.estabelecimento.estado.sigla,
                    cep: dataCnpjws.estabelecimento.cep,
                    telefone: dataCnpjws.estabelecimento.telefone1 || '',
                    natureza_juridica: dataCnpjws.natureza_juridica.descricao,
                    simples_nacional: dataCnpjws.simples?.simples === 'Sim',
                    mei: dataCnpjws.simples?.mei === 'Sim',
                    atividade_principal: dataCnpjws.estabelecimento.atividade_principal.descricao,
                    atividades_secundarias: dataCnpjws.estabelecimento.atividades_secundarias,
                    porte_da_empresa: dataCnpjws.porte.descricao,
                    inscricao_estadual: dataCnpjws.estabelecimento.inscricoes_estaduais.length > 0 ? dataCnpjws.estabelecimento.inscricoes_estaduais[0].inscricao_estadual : null,
                };
            }
        } catch (error) {
            console.error('Erro ao conectar à API cnpj.ws:', error);
        }
    }

    // Se conseguiu ou não os dados da empresa, insere na tabela 'empresas'
    const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert(empresaData ? [empresaData] : [{ cnpj: formattedCnpj }])
        .select()
        .single();

    if (empresaError) {
        console.error("Erro ao registrar a empresa:", empresaError);
        return;
    }

    console.log("Empresa criada:", empresa);

    // Cria o usuário na tabela usuarios
    const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{
            nome,
            email,
            empresa_id: empresa.id,
            administrador: true,
            avatar_letra: email.charAt(0).toUpperCase(),  // Usando Material-UI Avatar
        }])
        .select('id')
        .single();

    if (usuarioError) {
        console.error("Erro ao registrar o usuário:", usuarioError);
        return;
    }

    // Atualiza a tabela empresas com o ID do usuário
    const { error: updateEmpresaError } = await supabase
        .from('empresas')
        .update({ usuarios_id: usuarioData?.id })
        .eq('id', empresa.id);

    if (updateEmpresaError) {
        console.error("Erro ao associar o usuário à empresa:", updateEmpresaError);
        return;
    }

    console.log("Empresa atualizada com o ID do usuário");

    // Exclui o registro da tabela pesquisa_cnpj
    await supabase
        .from('pesquisa_cnpj')
        .delete()
        .eq('email', email);
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Adiciona o estado para controlar a visibilidade da senha
    const [totpCode, setTotpCode] = useState('');
    const [usuarioData, setUsuarioData] = useState<any>(null);


    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data: user, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Erro ao fazer login:", error.message);

                if (error.message === 'Email not confirmed') {
                    setModalTitle('E-mail não verificado');
                    setModalMessage('Sua conta ainda não foi confirmada. Por favor, siga as instruções no email que lhe enviamos.');
                } else if (error.message === 'Invalid login credentials') {
                    setModalTitle('Erro ao fazer login');
                    setModalMessage('E-mail ou senha incorretos.');
                } else if (error.message === 'User not found') {
                    setModalTitle('Erro ao fazer login');
                    setModalMessage('Usuário não cadastrado.');
                } else {
                    setModalTitle('Erro ao fazer login');
                    setModalMessage('Ocorreu um erro. Por favor, tente mais tarde.');
                }

                setIsSuccess(false);
                setModalOpen(true);
                return;
            }

            // Verifica se é um administrador que está fazendo o primeiro login
            const { data: pesquisaData } = await supabase
                .from('pesquisa_cnpj')
                .select('cnpj, nome')
                .eq('email', email)
                .single();

            if (pesquisaData) {
                // Passar email, nome e cnpj diretamente para a função
                await processCNPJData(email, pesquisaData.nome, pesquisaData.cnpj);
            }

            // Buscar dados do usuário para verificar se 2FA está ativo e trazer outras informações
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select(`
                    id, autenticacao_2fa, segredo_2fa,url_2fa, avatar_letra, avatar_url, nome, telefone,
                    administrador, empresa_id, tema, notificacao_email, notificacao_whatsapp,
                    notificacao_push, idioma, email
                `)
                .single();

            if (userError) {
                console.error('Erro ao buscar informações do usuário:', userError.message);
            } else {
                // Armazenar os dados no sessionStorage
                sessionStorage.setItem('userId', userData.id);
                sessionStorage.setItem('email', userData.email);
                sessionStorage.setItem('avatar_letra', userData.avatar_letra);
                sessionStorage.setItem('avatar_url', userData.avatar_url || '');
                sessionStorage.setItem('nome', userData.nome);
                sessionStorage.setItem('telefone', userData.telefone || '');
                sessionStorage.setItem('administrador', userData.administrador);
                sessionStorage.setItem('empresa_id', userData.empresa_id);
                sessionStorage.setItem('tema', userData.tema);
                //usado na tela perfil aba configuração para aplicar o tema somente em perfil antes de salvar
                sessionStorage.setItem('temaSelecionado', userData.tema);
                sessionStorage.setItem('notificacaoEmail', userData.notificacao_email || false);
                sessionStorage.setItem('notificacaoWhatsapp', userData.notificacao_whatsapp || false);
                sessionStorage.setItem('notificacaoPush', userData.notificacao_push || true);
                sessionStorage.setItem('idioma', userData.idioma);
                sessionStorage.setItem('autenticacao_2fa', userData.autenticacao_2fa);
                sessionStorage.setItem('segredo_2fa', userData.segredo_2fa || '');
                sessionStorage.setItem('url_2fa', userData.url_2fa || '');
            }

            if (userData?.autenticacao_2fa) {
                // Exibir campo para o código TOTP
                if (!totpCode) {
                    setModalTitle('Código 2FA');
                    setModalMessage('Insira o código do Google Authenticator.');
                    setIsSuccess(false);
                    setModalOpen(true);
                    return;
                }

                // Validar o código TOTP via backend
                const response = await fetch('/api/2fa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user.user?.id, totpCode }),
                });

                const result = await response.json();

                if (!response.ok || !result.isValid) {
                    setModalTitle('Erro');
                    setModalMessage('Código 2FA inválido.');
                    setIsSuccess(false);
                    setModalOpen(true);
                    return;
                }
            }

            // Chama a rota da API para obter o IP, o navegador e a cidade
            const ipResponse = await fetch('/api/pegar_ip');
            const { ip, userAgent, city } = await ipResponse.json();

            // Registrar o log de atividade de login
            if (userData) {
                const { error: logError } = await supabase
                    .from('logs_atividade')
                    .insert([{
                        usuario_id: userData.id, // Usando o ID do usuário recuperado
                        tipo_atividade: 'login',
                        data_hora: new Date(),
                        ip,
                        navegador: userAgent,
                        cidade: city || 'Cidade não disponível', // Associa a cidade recuperada ou um valor padrão
                        empresa_id: userData.empresa_id,  // Associa a empresa também
                    }]);

                if (logError) {
                    console.error('Erro ao registrar log de atividade:', logError.message);
                }
            } else {
                console.error('Erro: userData é nulo.');
            }
            
            // Redireciona para a home/dashboard
            window.location.href = 'logado/dashboard';

        } catch (error) {
            console.error('Erro inesperado:', (error as Error).message);
            setModalTitle('Erro inesperado');
            setModalMessage('Ocorreu um erro inesperado. Tente novamente mais tarde.');
            setIsSuccess(false);
            setModalOpen(true);
        }
    };

    return (
        <div className="login-flex-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="mb-4">Login</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="formulario-label">Endereço de e-mail</label>
                    <input
                        type="email"
                        className="formulario-elementos"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="formulario-label">Senha</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="formulario-elementos"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="show-password-btn"
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                        >
                            👁️
                        </button>
                    </div>




                    {usuarioData?.autenticacao_2fa && (
                        <div className="mb-3">
                            <label htmlFor="totp" className="formulario-label">Código 2FA</label>
                            <input
                                type="text"
                                className="formulario-elementos"
                                id="totp"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                required
                            />
                        </div>
                    )}




                </div>
                <button type="submit" className="botao botaoPrimario w-100">Entrar</button>

                <div className="mt-3 text-center">
                    <a href="/cadastro" className="text-decoration-none">Ainda não tem uma conta? Cadastre-se</a>
                </div>
            </form>

            {/* Links para Esqueci a Senha e Reenviar Verificação */}
            <div className="login-links mt-3">
                <a href="/esqueci_minha_senha" className="resend-link">Esqueci a senha</a>
                <a href="/reenviar_verificacao" className="resend-link">Reenviar verificação</a>
            </div>

            {/* Adiciona a CustomModal para exibir mensagens */}
            <CustomModal
                open={modalOpen}
                handleClose={handleCloseModal}
                title={modalTitle}
                message={modalMessage}
                isSuccess={isSuccess}
            />
        </div>
    );
}

