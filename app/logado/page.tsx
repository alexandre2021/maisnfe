'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Avatar, IconButton, Tooltip, Box, Drawer, Typography, Tabs, Tab } from '@mui/material';
import { LogoDevOutlined, Dashboard, PeopleAlt, Article, Settings } from '@mui/icons-material';
import Image from 'next/image';
import PerfilPessoal from '../perfilPessoal/page';


type SidebarProps = {
    tema: 'claro' | 'escuro';
    avatarUrl?: string | null;
    avatarLetra: string;
};

const LogadoPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);

    const [tema, setTema] = useState<'claro' | 'escuro'>('claro');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarLetra, setAvatarLetra] = useState<string>('A');
    const [nome, setNome] = useState<string>('');
    const [telefone, setTelefone] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [administrador, setAdministrador] = useState<boolean>(false);
    const [notificacaoEmail, setNotificacaoEmail] = useState<boolean>(false);
    const [notificacaoWhatsapp, setNotificacaoWhatsapp] = useState<boolean>(false);
    const [notificacaoPush, setNotificacaoPush] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userData, error } = await supabase
                    .from('usuarios')
                    .select('nome, telefone, email, administrador, avatar_url, avatar_letra, notificacao_email, notificacao_whatsapp, notificacao_push')
                    .eq('email', session.user.email)
                    .single();

                if (error) {
                    console.error('Erro ao buscar informações do usuário:', error.message);
                } else {
                    setNome(userData.nome);
                    setTelefone(userData.telefone);
                    setEmail(userData.email);
                    setAdministrador(userData.administrador);
                    setAvatarUrl(userData.avatar_url);
                    setAvatarLetra(userData.avatar_letra);
                    setNotificacaoEmail(userData.notificacao_email);
                    setNotificacaoWhatsapp(userData.notificacao_whatsapp);
                    setNotificacaoPush(userData.notificacao_push);
                }
            }
        };

        fetchUserData();
    }, []);



    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 80,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 80,
                        boxSizing: 'border-box',
                        backgroundColor: tema === 'claro' ? '#f8f9fa' : '#121212',
                        color: tema === 'claro' ? '#000000' : '#ffffff',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                    }}
                >
                    {/* Parte superior com o ícone Logo */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'top',
                        height: '60px', // Aumente ou ajuste conforme necessário
                    }}>
                        <LogoDevOutlined sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                    </Box>

                    {/* Ícones do meio */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Tooltip title="Dashboard" placement="right">
                            <IconButton>
                                <Dashboard sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuários" placement="right">
                            <IconButton>
                                <PeopleAlt sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clientes" placement="right">
                            <IconButton>
                                <Article sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Configurações" placement="right">
                            <IconButton>
                                <Settings sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Avatar na parte inferior */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton size="large">
                            {avatarUrl ? (
                                <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden' }}>
                                    <Image
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        width={50}
                                        height={50}
                                        style={{ borderRadius: '50%' }}
                                        quality={100}
                                        priority
                                    />
                                </div>
                            ) : (
                                <Avatar sx={{ bgcolor: tema === 'claro' ? '#1976d2' : '#90caf9', width: 50, height: 50 }}>
                                    {avatarLetra}
                                </Avatar>
                            )}
                        </IconButton>
                    </Box>
                </Box>
            </Drawer>

            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Perfil
                </Typography>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab label="Pessoal" />
                    <Tab label="Aparência" />
                    <Tab label="Segurança" />
                    <Tab label="Acessos" />
                    <Tab label="Cancelar" />
                </Tabs>

                {/* Conteúdo das tabs */}
                <Box role="tabpanel" hidden={selectedTab !== 0} p={3}>
                    <PerfilPessoal
                        nome={nome}
                        setNome={setNome}
                        telefone={telefone}
                        setTelefone={setTelefone}
                        email={email}
                        administrador={administrador}
                        avatarUrl={avatarUrl}
                        avatarLetra={avatarLetra}
                        notificacaoEmail={notificacaoEmail}
                        setNotificacaoEmail={setNotificacaoEmail}
                        notificacaoWhatsapp={notificacaoWhatsapp}
                        setNotificacaoWhatsapp={setNotificacaoWhatsapp}
                        notificacaoPush={notificacaoPush}
                        setNotificacaoPush={setNotificacaoPush}
                        handleSavePessoal={() => console.log('Salvar Pessoal')}
                        handleFileChange={(event) => console.log(event.target.files)}
                    />
                </Box>
                <Box role="tabpanel" hidden={selectedTab !== 1} p={3}>
                    <Typography>Conteúdo da aba Aparência</Typography>
                </Box>
                <Box role="tabpanel" hidden={selectedTab !== 2} p={3}>
                    <Typography>Conteúdo da aba Segurança</Typography>
                </Box>
                <Box role="tabpanel" hidden={selectedTab !== 3} p={3}>
                    <Typography>Conteúdo da aba Acessos</Typography>
                </Box>
                <Box role="tabpanel" hidden={selectedTab !== 4} p={3}>
                    <Typography>Conteúdo da aba Cancelar</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default LogadoPage;




