'use client';

import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { TextField, Button, Box, Typography, IconButton, InputAdornment, Modal } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CustomModal from '../componentes/modal';
import Link from 'next/link';

// Reintroduzindo as variáveis de controle de tempo
let lastRequestTimeCnpja: number | null = null;
let lastRequestTimeCnpjws: number | null = null;

// Função para aguardar o tempo necessário entre as requisições
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
    const [isTotpModalOpen, setIsTotpModalOpen] = useState(false);



    const handleCloseModal = () => {
        setModalOpen(false);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Prossegue com o login
        const { error } = await supabase.auth.signInWithPassword({
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
        } else {
            const { error: dbError } = await supabase
                .from('usuarios')
                .update({
                    verificado_2fa: false,
                })
                .eq('email', email);

            if (dbError) {
                // Se houver erro ao buscar a informação de autenticacao_2fa, encerrar a sessão
                console.error('Erro ao buscar informações no banco de dados:', dbError.message);
                await supabase.auth.signOut();
                return;
            }
            // Nesse ponto o login foi feito com sucesso
            // Buscar dados do usuário para outras informações
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('autenticacao_2fa, id, empresa_id, tema')
                .eq('email', email)
                .single();
            if (userError) {
                // Se houver erro ao buscar a informação de autenticacao_2fa, encerrar a sessão
                console.error('Erro ao buscar informações do usuário:', userError.message);
                await supabase.auth.signOut();
                return;
            } else {
                // Nesse ponto o login foi feito com sucesso e tenho informação sobre 2fa
                if (userData.autenticacao_2fa) {
                    // autenticacao_2fa é verdadeira, então abrir o modal para capturar o código TOTP
                    setIsTotpModalOpen(true);
                    return;
                } else {
                    // autenticacao_2fa é falsa, então prosseguir com pesquisa de CNPJ e pesquisa de IP

                    // Precisa para renderizar loga na carga da página
                    sessionStorage.setItem('tema', userData.tema);

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

                    // Chama a rota da API para obter o IP, o navegador e a cidade
                    const ipResponse = await fetch('/api/pegar_ip');
                    const { ip, userAgent, city } = await ipResponse.json();

                    // Registrar o log de atividade de login

                    const { error: logError } = await supabase
                        .from('logs_atividade')
                        .insert([{
                            usuario_id: userData.id,
                            tipo_atividade: 'login',
                            data_hora: new Date(),
                            ip,
                            navegador: userAgent,
                            cidade: city || 'Cidade não disponível',
                            empresa_id: userData.empresa_id,
                        }]);

                    if (logError) {
                        console.error('Erro ao registrar log de atividade:', logError.message);
                    }

                    // Redireciona para a home/dashboard
                    window.location.href = 'logado/dashboard';
                }
            }
        }
    };

    const handleTotpSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // Obtém a sessão do Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Erro ao obter a sessão:', sessionError.message);
            return;
        }

        const email = session?.user?.email;

        if (!email) {
            console.error('Email não encontrado.');
            await supabase.auth.signOut();
            return;
        }

        const totpInput = document.getElementById('totp-code') as HTMLInputElement | null;

        if (totpInput !== null) {
            const totpCode = totpInput.value;

            // Buscar os dados do usuário necessários para validação
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('segredo_2fa, id, empresa_id, tema')
                .eq('email', email)
                .single();

            if (userError) {
                console.error('Erro ao buscar informações do usuário:', userError.message);
                await supabase.auth.signOut();
                return;
            }

            if (!userData?.segredo_2fa) {
                console.error('Segredo TOTP não encontrado.');
                await supabase.auth.signOut();
                return;
            }

            // Valida o código TOTP usando o segredo recuperado
            const response = await fetch('/api/validar_totp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ totpCode, userSecret: userData.segredo_2fa }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setModalTitle('Erro');
                setModalMessage('Código 2FA inválido.');
                setIsSuccess(false);
                setModalOpen(true);
                return;
            }

            // Para evitar que mesmo sem informar o código 2FA, o usuário consiga acessar a página
            // Nas páginas logadas se autenticacao_2fa for true e verificado_2fa for false, redirecionar para a página de login

            const { error: dbError } = await supabase
            .from('usuarios')
            .update({
                verificado_2fa: true,
            })
            .eq('email', email);

            if (dbError) {
                // Se houver erro ao buscar a informação de autenticacao_2fa, encerrar a sessão
                console.error('Erro ao buscar informações no banco de dados:', dbError.message);
                await supabase.auth.signOut();
                return;
            }

            // Precisa para renderizar loga na carga da página
            sessionStorage.setItem('tema', userData.tema);

            const { data: pesquisaData } = await supabase
                .from('pesquisa_cnpj')
                .select('cnpj, nome')
                .eq('email', email)
                .single();

            if (pesquisaData) {
                // Passar email, nome e cnpj diretamente para a função
                await processCNPJData(email, pesquisaData.nome, pesquisaData.cnpj);
            }

            // Chama a rota da API para obter o IP, o navegador e a cidade
            const ipResponse = await fetch('/api/pegar_ip');
            const { ip, userAgent, city } = await ipResponse.json();

            // Registrar o log de atividade de login

            const { error: logError } = await supabase
                .from('logs_atividade')
                .insert([{
                    usuario_id: userData.id,
                    tipo_atividade: 'login',
                    data_hora: new Date(),
                    ip,
                    navegador: userAgent,
                    cidade: city || 'Cidade não disponível',
                    empresa_id: userData.empresa_id,
                }]);

            if (logError) {
                console.error('Erro ao registrar log de atividade:', logError.message);
            }

            // Redireciona para a home/dashboard
            window.location.href = 'logado/dashboard';

        } else {
            setModalTitle('Erro');
            setModalMessage('Código 2FA inválido. Tente novamente.');
            setIsSuccess(false);
            setModalOpen(true);
        }
    };



    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: 350,
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 4,
                    border: '1px solid #ccc',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        marginBottom: 3,
                        marginTop: 0,
                    }}
                >
                    Login
                </Typography>
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    required
                    sx={{ marginBottom: 2 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Senha"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    sx={{ marginBottom: 3 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                        paddingTop: 1,
                        paddingBottom: 1,
                        marginBottom: 2,
                    }}
                >
                    ENTRAR
                </Button>

                {/* Modal para capturar totp */}
                <Modal
                    open={isTotpModalOpen}
                    onClose={() => setIsTotpModalOpen(false)}
                    aria-labelledby="modal-totp-title"
                    aria-describedby="modal-totp-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 300,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 24,
                            p: 3,
                            textAlign: 'center',
                        }}
                    >
                        <Typography
                            id="modal-totp-title"
                            variant="h6"
                            component="h2"
                            sx={{ marginBottom: 2 }}
                        >
                            Código 2FA
                        </Typography>
                        <TextField
                            id="totp-code"
                            label="Insira o código"
                            variant="outlined"
                            fullWidth
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleTotpSubmit}
                            fullWidth
                        >
                            Verificar
                        </Button>
                    </Box>
                </Modal>
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        marginBottom: 1,
                        color: '#007bff',
                    }}
                >
                    <Link href="/cadastro">
                        Ainda não tem uma conta? Cadastre-se
                    </Link>
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        color: '#007bff',
                    }}
                >
                    <Link href="/esqueci_minha_senha">
                        Esqueci minha senha
                    </Link>
                    {' | '}
                    <Link href="/reenviar_verificacao">
                        Reenviar verificação
                    </Link>
                </Typography>
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: 'gray',
                    textAlign: 'center',
                    marginTop: 2,
                }}
            >
                * campo obrigatório
            </Typography>

            <CustomModal
                open={modalOpen}
                handleClose={handleCloseModal}
                title={modalTitle}
                message={modalMessage}
                isSuccess={isSuccess}
            />
        </Box>
    );
}

