'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import {
    Button, Tabs, Tab, Box, Avatar, IconButton, TextField, Fab, CircularProgress,
    CssBaseline, FormGroup, FormControlLabel, Switch, Typography, Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridColDef } from '@mui/x-data-grid';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import PhoneNumberInput from '../../componentes/telefone_input';
import CustomModal from '../../componentes/modal';
import { format } from 'date-fns';

const Perfil = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    //const [user, setUser] = useState<any>(null);
    const [imageUrlBancoDeDados, setImageUrlBancoDeDados] = useState<string | null>(null);
    const [imageUrlTela, setImageUrlTela] = useState<string | null>(null);
    const [avatarLetra, setAvatarLetra] = useState<string>('');
    const [nome, setNome] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [administrador, setAdministrador] = useState<boolean>(false);
    const [telefone, setTelefone] = useState<string>('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<{ title: string; message: string; isSuccess: boolean }>({ title: '', message: '', isSuccess: true });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notificacaoEmail, setNotificacaoEmail] = useState(false);
    const [notificacaoWhatsapp, setNotificacaoWhatsapp] = useState(false);
    const [notificacaoPush, setNotificacaoPush] = useState(false);
    const [idioma, setIdioma] = useState('português');
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 5 });
    const [autenticacao2fa, setAutenticacao2fa] = useState<string>('');
    const [url2fa, setUrl2fa] = useState<string>('');
    const [segredo2fa, setSegredo2fa] = useState<string>('');
    const [codigo2fa, setCodigo2fa] = useState<string>('');
    //uso para armazenar os dados carregados na tabela em row
    const [logsAtividade, setLogsAtividade] = useState<any[]>([]);
    //as colunas data e cidade serão do tipo singleSelect e precisão das opções em valueOptions
    const [dateOptions, setDateOptions] = useState<string[]>([]);
    const [cityOptions, setCityOptions] = useState<string[]>([]);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setIsAuthenticated(true);
                    if (typeof window !== 'undefined') {
                        // Somente será executado no lado do cliente
                        setImageUrlTela(sessionStorage.getItem('avatar_url') || '');
                        setImageUrlBancoDeDados(sessionStorage.getItem('avatar_url') || '');
                        setAvatarLetra(sessionStorage.getItem('avatar_letra') || 'A');
                        setNome(sessionStorage.getItem('nome') || '');
                        setTelefone(sessionStorage.getItem('telefone') || '');
                        setAdministrador(sessionStorage.getItem('administrador') === 'true');
                        setNotificacaoEmail(sessionStorage.getItem('notificacaoEmail') === 'true');
                        setNotificacaoWhatsapp(sessionStorage.getItem('notificacaoWhatsapp') === 'true');
                        setNotificacaoPush(sessionStorage.getItem('notificacaoPush') === 'true');
                        setIdioma(sessionStorage.getItem('idioma') || 'português');
                        setAutenticacao2fa(sessionStorage.getItem('autenticacao_2fa') || 'false');
                        setUrl2fa(sessionStorage.getItem('url_2fa') || '');
                        setSegredo2fa(sessionStorage.getItem('segredo_2fa') || '');
                        setEmail(sessionStorage.getItem('email') || '');

                        const storedEmail = sessionStorage.getItem('email');
                        if (storedEmail) {
                            setEmail(storedEmail);
                        }

                        const userId = sessionStorage.getItem('userId');

                        // Carrega logs de atividade para a aba de segurança
                        const fetchLogsAtividade = async () => {
                            try {
                                const { data, error } = await supabase
                                    .from('logs_atividade')
                                    .select('data_hora, ip, cidade, navegador')
                                    .eq('usuario_id', userId)
                                    .order('data_hora', { ascending: false }); // Ordena do mais recente para o mais antigo

                                if (error) {
                                    console.error('Erro ao buscar logs de atividade:', error);
                                } else {
                                    // Formata a data para string no formato desejado e cria arrays para opções de data e cidade
                                    const formattedData = data?.map((log, index) => ({
                                        id: index, // Adiciona um id único baseado no índice começa em 0
                                        ...log,
                                        data_hora: format(new Date(log.data_hora), 'dd/MM/yyyy HH:mm')
                                    })) || [];

                                    // Cria um conjunto único de datas e cidades
                                    const dateSet = new Set(formattedData.map(log => log.data_hora));
                                    const citySet = new Set(formattedData.map(log => log.cidade));

                                    // Converte os conjuntos em arrays para serem usados como opções de seleção
                                    const dateOptions = Array.from(dateSet);
                                    const cityOptions = Array.from(citySet);

                                    // Atualiza o estado com os logs formatados e as opções geradas
                                    setLogsAtividade(formattedData);
                                    setDateOptions(dateOptions); // Certifique-se de ter o estado `dateOptions`
                                    setCityOptions(cityOptions); // Certifique-se de ter o estado `cityOptions`
                                }
                            } catch (error) {
                                console.error('Erro inesperado ao buscar logs de atividade:', error);
                            }
                        };

                        await fetchLogsAtividade(); // Certifique-se de aguardar a conclusão da função

                        // Controle das abas e modal de sucesso após salvar
                        if (sessionStorage.getItem('reload') === 'sim') {
                            sessionStorage.removeItem('reload');
                            setSelectedTab(1);
                        }
                        if (sessionStorage.getItem('salvaPessoal') === 'sim') {
                            sessionStorage.removeItem('salvaPessoal');
                            setModalContent({
                                title: 'Sucesso',
                                message: 'Dados salvos com sucesso!',
                                isSuccess: true,
                            });
                            setModalOpen(true);
                        }

                    }
                } else {
                    setIsAuthenticated(false);
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                setIsAuthenticated(false);
                router.push('/login');
            } finally {
                setIsLoading(false); // Define o carregamento como concluído
            }
        };
        checkAuth();
    }, [router]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setNewAvatarFile(file);

            // Cria um URL temporário para exibir a nova imagem imediatamente																									
            const objectUrl = URL.createObjectURL(file);
            setImageUrlTela(objectUrl); // Atualiza o estado imageUrlTela com o URL temporário																									
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };    

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    const handleSavePessoal = async () => {
        try {
            const email = sessionStorage.getItem('email'); // Obtém o email do sessionStorage

            if (!email) {
                console.error('Email do usuário não encontrado no sessionStorage');
                return;
            }

            let newAvatarUrl = imageUrlTela; // Manter a URL existente, caso nenhuma nova imagem seja carregada

            if (newAvatarFile) {
                if (imageUrlBancoDeDados) {
                    const pathToDelete = imageUrlBancoDeDados.split(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/`).pop();

                    if (pathToDelete) {
                        try {
                            const response = await fetch('/api/remover_imagem', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ imagePath: pathToDelete }),
                            });

                            const result = await response.json();

                            if (!response.ok) {
                                setModalContent({
                                    title: 'Erro',
                                    message: 'Erro ao deletar a imagem antiga: ' + result.error,
                                    isSuccess: false,
                                });
                                setModalOpen(true);
                                return;
                            }

                        } catch (error) {
                            setModalContent({
                                title: 'Erro',
                                message: 'Erro inesperado ao tentar deletar a imagem.',
                                isSuccess: false,
                            });
                            setModalOpen(true);
                            return;
                        }
                    }
                }

                const uniqueFileName = `${uuidv4()}-${newAvatarFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(`public/${uniqueFileName}`, newAvatarFile);

                if (uploadError) {
                    setModalContent({
                        title: 'Erro',
                        message: 'Erro ao salvar a nova imagem: ' + uploadError.message,
                        isSuccess: false,
                    });
                    setModalOpen(true);
                    return;
                }

                newAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/public/${uniqueFileName}`;
                setImageUrlTela(newAvatarUrl);
                setImageUrlBancoDeDados(newAvatarUrl);

                // Atualiza no sessionStorage
                sessionStorage.setItem('avatar_url', newAvatarUrl || '');
            }

            // Atualiza as informações de perfil pessoal no banco de dados
            const { error: dbError } = await supabase
                .from('usuarios')
                .update({
                    avatar_url: newAvatarUrl,
                    nome,
                    telefone,
                })
                .eq('email', email);

            if (dbError) {
                setModalContent({
                    title: 'Erro',
                    message: 'Erro ao atualizar os dados no banco de dados: ' + dbError.message,
                    isSuccess: false,
                });
                setModalOpen(true);
                return;
            }

            // Atualiza sessionStorage com os novos valores
            sessionStorage.setItem('nome', nome);
            sessionStorage.setItem('telefone', telefone || '');

            sessionStorage.setItem('salvaPessoal', 'sim')

            window.location.reload();

        } catch (error) {
            if (error instanceof Error) {
                console.error('Erro inesperado ao salvar dados:', error.message);
                setModalContent({
                    title: 'Erro',
                    message: `Erro inesperado ao salvar dados: ${error.message}`,
                    isSuccess: false,
                });
            } else {
                console.error('Erro inesperado:', error);
                setModalContent({
                    title: 'Erro',
                    message: 'Erro inesperado ao salvar dados.',
                    isSuccess: false,
                });
            }
            setModalOpen(true);
        }
    };

    // Função para alternar o tema no estado e no sessionStorage e salvar no banco de dados
    const handleTemaChange = async (novoTema: 'claro' | 'escuro') => {

        sessionStorage.setItem('tema', novoTema);

        try {
            const email = sessionStorage.getItem('email'); // Obtém o email do sessionStorage
            if (!email) {
                console.error('Email do usuário não encontrado no sessionStorage');
                return;
            }

            const { error } = await supabase
                .from('usuarios')
                .update({ tema: novoTema })
                .eq('email', email);

            if (error) {
                console.error('Erro ao atualizar o tema no banco de dados:', error.message);
            } else {


                // Aqui você pode adicionar um reload para aplicar o tema em todo o aplicativo
                sessionStorage.setItem('reload', 'sim')
                window.location.reload();
            }
        } catch (error) {
            console.error('Erro inesperado ao salvar o tema:', error);
        }
    };

    // Função para alterar preferências de notificações e salvar no banco de dados
    const handleToggleNotification = async (type: 'email' | 'whatsapp' | 'push', value: boolean) => {
        try {
            const email = sessionStorage.getItem('email'); // Obtém o email do sessionStorage
            if (!email) {
                console.error('Email do usuário não encontrado no sessionStorage');
                return;
            }

            // Atualiza o estado correspondente
            switch (type) {
                case 'email':
                    setNotificacaoEmail(value);
                    sessionStorage.setItem('notificacaoEmail', value.toString());
                    break;
                case 'whatsapp':
                    setNotificacaoWhatsapp(value);
                    sessionStorage.setItem('notificacaoWhatsapp', value.toString());
                    break;
                case 'push':
                    setNotificacaoPush(value);
                    sessionStorage.setItem('notificacaoPush', value.toString());
                    break;
            }

            // Salva no banco de dados
            const { error } = await supabase
                .from('usuarios')
                .update({
                    notificacao_email: type === 'email' ? value : notificacaoEmail,
                    notificacao_whatsapp: type === 'whatsapp' ? value : notificacaoWhatsapp,
                    notificacao_push: type === 'push' ? value : notificacaoPush,
                })
                .eq('email', email);

            if (error) {
                console.error('Erro ao atualizar as notificações no banco de dados:', error.message);
            }
        } catch (error) {
            console.error('Erro inesperado ao salvar as notificações:', error);
        }
    };

    // Função para alterar o idioma e salvar no banco de dados
    const handleIdiomaChange = async (novoIdioma: string) => {
        setIdioma(novoIdioma);
        sessionStorage.setItem('idioma', novoIdioma);

        try {
            const email = sessionStorage.getItem('email'); // Obtém o email do sessionStorage
            if (!email) {
                console.error('Email do usuário não encontrado no sessionStorage');
                return;
            }

            const { error } = await supabase
                .from('usuarios')
                .update({ idioma: novoIdioma })
                .eq('email', email);

            if (error) {
                console.error('Erro ao atualizar o idioma no banco de dados:', error.message);
            }
        } catch (error) {
            console.error('Erro inesperado ao salvar o idioma:', error);
        }
    };


    // Funções para senha

    const handleResetPassword = async () => {
        if (!email) {
            setModalContent({
                title: 'Erro',
                message: 'Email não encontrado.',
                isSuccess: false,
            });
            setModalOpen(true);
            return;
        }
    
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:3000/nova_senha?email=${email}`,
        });
    
        if (error) {
            setModalContent({
                title: 'Erro',
                message: 'Erro ao enviar link de redefinição de senha.',
                isSuccess: false,
            });
        } else {
            setModalContent({
                title: 'Sucesso',
                message: "Email com orientações para redefinir senha enviado com sucesso.",
                isSuccess: true,
            });
        }
    
        setModalOpen(true);
    };

    // Funções para tratar 2FA

    const gerarQRCode = async () => {
        try {
            const email = sessionStorage.getItem('email');

            if (!email) {
                console.error('Email não encontrado.');
                return;
            }

            // Fazendo a requisição para a rota do backend
            const response = await fetch('/api/gerar_segredo', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const { secret, qrCodeDataUrl } = await response.json();

                // Salvando o segredo e a URL no banco de dados
                const { error } = await supabase
                    .from('usuarios')
                    .update({ segredo_2fa: secret, autenticacao_2fa: false, url_2fa: qrCodeDataUrl })
                    .eq('email', email);

                if (error) {
                    console.error('Erro ao salvar o segredo no banco de dados:', error.message);
                    return;
                }

                // Atualiza a sessionStorage
                sessionStorage.setItem('segredo_2fa', secret);
                setSegredo2fa(secret);
                if (qrCodeDataUrl) {
                    sessionStorage.setItem('url_2fa', qrCodeDataUrl);
                    setUrl2fa(qrCodeDataUrl);
                }
                setAutenticacao2fa('false'); // Resetando para falso, já que a autenticação ainda não foi confirmada
            } else {
                const errorData = await response.json();
                console.error('Erro ao gerar o QR Code:', errorData.error);
            }
        } catch (error) {
            console.error('Erro ao gerar o QR Code:', error);
        }
    };


    const ativar2FA = async () => {
        try {
            const email = sessionStorage.getItem('email');

            if (!email) {
                console.error('Email não encontrado.');
                return;
            }

            const segredo2fa = sessionStorage.getItem('segredo_2fa');

            if (!segredo2fa) {
                console.error('Segredo TOTP não encontrado.');
                return;
            }

            // Verifica se o campo de código 2FA foi preenchido
            if (!codigo2fa) {
                setModalContent({
                    title: 'Campo Obrigatório',
                    message: 'Por favor, preencha o campo de código de autenticação.',
                    isSuccess: false,
                });
                setModalOpen(true);
                return;
            }

            console.log('Enviando requisição para /api/validar_totp com:', {
                totpCode: codigo2fa,
                userSecret: segredo2fa,
            });

            const response = await fetch('/api/validar_totp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ totpCode: codigo2fa, userSecret: segredo2fa }),
            });

            const result = await response.json();

            if (result.success) {
                const { error } = await supabase
                    .from('usuarios')
                    .update({ autenticacao_2fa: true })
                    .eq('email', email);
                if (error) {
                    console.error('Erro ao ativar o 2FA:', error.message);
                } else {
                    sessionStorage.setItem('autenticacao_2fa', 'true');
                    setAutenticacao2fa('true');
                    setModalContent({
                        title: 'Sucesso',
                        message: 'Autenticação de dois fatores ativada com sucesso!',
                        isSuccess: true,
                    });
                    setModalOpen(true);
                    setAutenticacao2fa('true');
                }
            } else {
                // Código inválido, exibe a modal de erro
                setModalContent({
                    title: 'Código Inválido',
                    message: 'O código de autenticação informado é inválido. Tente novamente.',
                    isSuccess: false,
                });
                setModalOpen(true);
            }
        } catch (error) {
            console.error('Erro ao ativar o 2FA:', error);
            setModalContent({
                title: 'Erro',
                message: `Ocorreu um erro ao tentar ativar o 2FA. Tente novamente mais tarde. Detalhes do erro: ${(error as Error).message}`,
                isSuccess: false,
            });
            setModalOpen(true);
        }
    };

    const desativar2FA = async () => {
        try {
            const email = sessionStorage.getItem('email');

            if (!email) {
                console.error('Email não encontrado.');
                return;
            }

            const { error } = await supabase
                .from('usuarios')
                .update({ autenticacao_2fa: false, segredo_2fa: null, url_2fa: null })
                .eq('email', email);

            if (error) {
                console.error('Erro ao desativar o 2FA:', error.message);
                setModalContent({
                    title: 'Erro',
                    message: 'Ocorreu um erro ao tentar desativar o 2FA. Tente novamente mais tarde.',
                    isSuccess: false,
                });
                setModalOpen(true);
                return;
            }

            // Atualiza sessionStorage
            sessionStorage.removeItem('segredo_2fa');
            sessionStorage.removeItem('url_2fa');
            sessionStorage.setItem('autenticacao_2fa', 'false');

            // Atualiza os estados
            setAutenticacao2fa('false');
            setUrl2fa('');
            setSegredo2fa('');
            setCodigo2fa('');

            // Exibe mensagem de sucesso
            setModalContent({
                title: 'Sucesso',
                message: 'Autenticação de dois fatores desativada com sucesso!',
                isSuccess: true,
            });
            setModalOpen(true);

        } catch (error) {
            console.error('Erro ao desativar o 2FA:', error);
            setModalContent({
                title: 'Erro',
                message: 'Ocorreu um erro ao tentar desativar o 2FA. Tente novamente mais tarde.',
                isSuccess: false,
            });
            setModalOpen(true);
        }
    };

    //tabela de logs

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer sx={{ height: '50px', minHeight: '50px' }}>
                <GridToolbarFilterButton />
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    };

    const columns: GridColDef[] = [
        {
            field: 'data_hora',
            headerName: 'Data',
            flex: 1, // cada coluna com flex 1 significa que dividirão da mesma forma o espaço disponível
            type: 'singleSelect',
            valueOptions: dateOptions,
        },
        {
            field: 'ip',
            headerName: 'IP',
            flex: 1,
            type: 'string',
            filterable: false,
            sortable: false
        },
        {
            field: 'cidade',
            headerName: 'Cidade',
            flex: 1,
            type: 'singleSelect',
            valueOptions: cityOptions,
        },
    ];


    return (
        <>
            <CssBaseline />
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0px 20px 20px 20px', width: '80vw', maxWidth: '700px', margin: '0 auto' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />                    </div>
                ) : (
                    <>
                        <Typography color="primary" variant="h4">
                            Perfil
                        </Typography>
                        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tabs">
                            <Tab label="Pessoal" />
                            <Tab label="Aparência" />
                            <Tab label="Segurança" />
                            <Tab label="Acessos" />
                            {administrador && <Tab label="Cancelar" />}
                        </Tabs>

                        {/* Tab Pessoal */}
                        <Box role="tabpanel" hidden={selectedTab !== 0} sx={{ width: '100%', paddingBottom: '20px' }}>
                            <Box
                                sx={{
                                    marginTop: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                {imageUrlTela ? (
                                    <Image
                                        src={imageUrlTela}
                                        alt="Avatar do usuário"
                                        width={100}
                                        height={100}
                                        style={{ borderRadius: '50%' }}
                                        priority={true}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{ width: 120, height: 120, fontSize: 60, bgcolor: '#007bff' }}
                                    >
                                        {avatarLetra}
                                    </Avatar>
                                )}
                                <IconButton
                                    component="label"
                                    sx={{ marginLeft: '20px' }}
                                >
                                    <CameraAltIcon />
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                        accept="image/png, image/jpeg"
                                    />
                                </IconButton>
                            </Box>
                            {/* Input para Nome */}
                            <TextField
                                label="Nome"
                                variant="outlined"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                            <PhoneNumberInput value={telefone} onChange={setTelefone} />
                            {/* Input para Email (não editável) */}
                            <TextField
                                label="Email"
                                variant="outlined"
                                value={email}
                                disabled
                                fullWidth
                                margin="normal"
                            />
                            {/* Campo para Administrador (não editável) */}
                            {administrador && (
                                <TextField
                                    label="Administrador"
                                    variant="outlined"
                                    value="Sim"
                                    disabled
                                    fullWidth
                                    margin="normal"
                                />
                            )}
                            {/* Notificações */}
                            <FormGroup row sx={{ marginTop: '15px' }}>
                                <Typography variant="subtitle1" sx={{ marginRight: '10px', lineHeight: '40px' }}>Notificações:</Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificacaoEmail}
                                            onChange={(e) => handleToggleNotification('email', e.target.checked)}
                                        />
                                    }
                                    label="Email"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificacaoWhatsapp}
                                            onChange={(e) => handleToggleNotification('whatsapp', e.target.checked)}
                                        />
                                    }
                                    label="WhatsApp"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificacaoPush}
                                            onChange={(e) => handleToggleNotification('push', e.target.checked)}
                                        />
                                    }
                                    label="Push"
                                />
                            </FormGroup>
                            {/* FAB para Salvar */}
                            <Fab
                                color="primary"
                                aria-label="save"
                                onClick={handleSavePessoal}
                                sx={{ position: 'fixed', bottom: '20px', right: '20px' }}
                            >
                                <SaveIcon />
                            </Fab>
                        </Box>

                        {/* Tab Aparência */}
                        <Box
                            role="tabpanel"
                            hidden={selectedTab !== 1}
                            sx={{
                                width: '100%',
                                paddingBottom: '20px',
                            }}
                        >
                            {/* Alternância de Tema Claro/Escuro */}
                            <div style={{ marginTop: '20px' }}>
                                <TextField
                                    label="Tema"
                                    variant="outlined"
                                    value={sessionStorage.tema}
                                    onChange={(e) => handleTemaChange(e.target.value as 'claro' | 'escuro')}
                                    fullWidth
                                    margin="normal"
                                    select
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="claro">Claro</option>
                                    <option value="escuro">Escuro</option>
                                </TextField>
                            </div>

                            {/* Idioma */}
                            <TextField
                                label="Idioma"
                                variant="outlined"
                                value={idioma}
                                onChange={(e) => handleIdiomaChange(e.target.value)}
                                fullWidth
                                margin="normal"
                                select
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="português">Português</option>
                                <option value="inglês">Inglês</option>
                                <option value="espanhol">Espanhol</option>
                            </TextField>
                        </Box>


                        {/* Tab Segurança */}
                        <Box role="tabpanel" hidden={selectedTab !== 2} sx={{ width: '100%', paddingTop: '10px', paddingBottom: '20px' }}>

                            {/* Alterar Senha */}
                            <Box>
                                <Typography variant="subtitle1" sx={{ marginRight: '10px' }}>Senha:</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ marginTop: '10px' }}
                                    onClick={handleResetPassword}
                                >
                                    Alterar Senha
                                </Button>

                                <CustomModal
                                    open={modalOpen}
                                    handleClose={() => setModalOpen(false)}
                                    title={modalContent.title}
                                    message={modalContent.message}
                                    isSuccess={modalContent.isSuccess}
                                />
                            </Box>

                            {/* Autenticação de dois fatores */}                           

                            <Box sx={{ marginBottom: '20px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
                                    <Typography variant="subtitle1" sx={{ marginRight: '10px' }}>
                                        Autenticação de dois fatores:
                                    </Typography>
                                    <Tooltip
                                        title="A autenticação de dois fatores (2FA) adiciona uma camada extra de segurança ao exigir não apenas sua senha, mas também um código gerado por um aplicativo em seu telefone."
                                        placement="right"  // Exibe o tooltip à direita do ícone
                                    >
                                        <InfoIcon color="action" />
                                    </Tooltip>
                                </Box>
                                {autenticacao2fa === 'false' && segredo2fa === '' && url2fa === '' && (
                                    <Button variant="contained" color="primary" onClick={gerarQRCode}>
                                        Gerar QR Code
                                    </Button>
                                )}
                                {autenticacao2fa === 'false' && segredo2fa !== '' && url2fa !== '' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px', backgroundColor: 'transparent', padding: '10px', borderRadius: '8px' }}>
                                        {/* Box para o campo de texto e botão */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '20px' }}>
                                            <TextField
                                                label="Código"
                                                variant="outlined"
                                                onChange={(e) => setCodigo2fa(e.target.value)}
                                                sx={{ marginBottom: '8px', width: '200px' }}  // Largura do campo igual à do botão
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={ativar2FA}
                                                sx={{ width: '200px' }}  // Largura do botão
                                            >
                                                Ativar 2FA
                                            </Button>
                                        </Box>

                                        {/* Box para o QR Code */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <Image
                                                src={url2fa}
                                                alt="QR Code para autenticação 2FA"
                                                width={200}
                                                height={200}
                                                quality={100}
                                                priority
                                            />
                                        </Box>
                                    </Box>
                                )}
                                {autenticacao2fa === 'true' && segredo2fa !== '' && url2fa !== '' && (
                                    <Button variant="contained" color="secondary" onClick={desativar2FA}>
                                        Desativar 2FA
                                    </Button>
                                )}
                            </Box>








                        </Box>

                        {/* Tab Log de acesso */}
                        <Box
                            role="tabpanel"
                            hidden={selectedTab !== 3}
                            sx={{


                                width: '100%',
                                paddingBottom: '10px',
                                paddingTop: '10px',
                                flexGrow: 1,
                                flexDirection: 'column',
                                height: 'calc(100vh - 140px)',
                                minHeight: 0, // Assegura que o container nunca tenha altura menor que o esperado


                            }}
                        >
                            <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
                                <DataGrid
                                    rows={logsAtividade}
                                    columns={columns}
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
                                    pageSizeOptions={[5, 10, 20]}
                                    disableColumnMenu
                                    disableColumnResize
                                    disableRowSelectionOnClick
                                    slots={{ toolbar: CustomToolbar }}
                                    initialState={{
                                        density: 'compact', // Define a densidade como "compacto"
                                    }}
                                    localeText={{
                                        noRowsLabel: 'Nenhum resultado encontrado',
                                        footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
                                        footerTotalRows: 'Total de linhas:',
                                        toolbarFilters: 'Filtros',
                                        toolbarExport: 'Exportar',
                                        toolbarDensity: 'Densidade',
                                        toolbarFiltersTooltipHide: 'Esconder filtros',
                                        toolbarFiltersTooltipShow: 'Mostrar filtros',
                                        toolbarFiltersTooltipActive: (count) => `${count} filtro(s) ativo(s)`,
                                        toolbarExportCSV: 'Baixar como CSV',
                                        toolbarExportPrint: 'Imprimir',
                                        toolbarDensityCompact: 'Compacto',
                                        toolbarDensityStandard: 'Padrão',
                                        toolbarDensityComfortable: 'Confortável',
                                        filterPanelAddFilter: 'Adicionar filtro',
                                        filterPanelDeleteIconLabel: 'Excluir',
                                        filterPanelOperator: 'Operador',
                                        filterPanelOperatorAnd: 'E',
                                        filterPanelOperatorOr: 'Ou',
                                        filterPanelColumns: 'Colunas',
                                        filterPanelInputLabel: 'Valor',
                                        filterPanelInputPlaceholder: 'Filtrar valor',
                                        filterOperatorContains: 'contém',
                                        filterOperatorEquals: 'igual a',
                                        filterOperatorStartsWith: 'começa com',
                                        filterOperatorEndsWith: 'termina com',
                                        filterOperatorIs: 'é',
                                        filterOperatorNot: 'não é',
                                        filterOperatorAfter: 'maior que',
                                        filterOperatorOnOrAfter: 'maior ou igual a',
                                        filterOperatorBefore: 'menor que',
                                        filterOperatorOnOrBefore: 'menor ou igual a',
                                        filterOperatorIsEmpty: 'está vazio',
                                        filterOperatorIsNotEmpty: 'não está vazio',
                                        filterOperatorIsAnyOf: 'é qualquer um de',
                                        columnMenuSortAsc: 'Ordenar por ASC',
                                        columnMenuSortDesc: 'Ordenar por DESC',
                                        columnMenuUnsort: 'Desordenar',
                                        columnMenuFilter: 'Filtrar',
                                        columnMenuHideColumn: 'Ocultar coluna',
                                        columnMenuManageColumns: 'Gerenciar colunas',
                                        columnHeaderSortIconLabel: 'Ordenar',
                                        MuiTablePagination: {
                                            labelRowsPerPage: 'Linhas por página',
                                            labelDisplayedRows: ({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`,
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Tab Cancelar Conta */}
                        {administrador && (
                            <Box role="tabpanel" hidden={selectedTab !== 4} sx={{ width: '100%', paddingBottom: '20px' }}>
                                {/* Conteúdo para cancelar conta */}
                            </Box>
                        )}

                        <CustomModal
                            open={modalOpen}
                            handleClose={() => setModalOpen(false)}
                            title={modalContent.title}
                            message={modalContent.message}
                            isSuccess={modalContent.isSuccess}
                        />
                    </>
                )}
            </div >
        </>
    );



};

export default Perfil;