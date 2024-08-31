'use client';

import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Typography, Box, Tooltip } from '@mui/material';
import { supabase } from '../utils/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type TopbarProps = {
    tema: 'claro' | 'escuro';
};

const Topbar: React.FC<TopbarProps> = ({ tema }) => {
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
    const [avatarLetra, setAvatarLetra] = React.useState<string>('A');
    const router = useRouter();

    React.useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userData, error: userError } = await supabase
                    .from('usuarios')
                    .select('avatar_letra, avatar_url')
                    .eq('email', session.user.email)
                    .single();

                if (userError) {
                    console.error('Erro ao buscar informações do usuário:', userError.message);
                } else {
                    setAvatarLetra(userData?.avatar_letra || 'A');
                    setAvatarUrl(userData?.avatar_url || null);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleAvatarClick = () => {
        router.push('/logado/perfil');
    };

    return (
        <AppBar position="fixed" sx={{ backgroundColor: tema === 'claro' ? '#f8f9fa' : '#121212', color: tema === 'claro' ? '#000000' : '#ffffff' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Mais NFe
                </Typography>
                <Box>
                    <Tooltip title="Perfil">
                        <IconButton onClick={handleAvatarClick} size="large" edge="end" color="inherit">
                            {avatarUrl ? (
                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
                                    <Image
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        width={40}
                                        height={40}
                                        style={{ borderRadius: '50%' }}
                                    />
                                </div>
                            ) : (
                                <Avatar sx={{ bgcolor: tema === 'claro' ? '#1976d2' : '#90caf9' }}>
                                    {avatarLetra}
                                </Avatar>
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;

