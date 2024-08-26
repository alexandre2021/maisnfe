import React, { useEffect, useState, useContext } from 'react';
import { Dashboard, PeopleAlt, Article, Settings, LogoDevOutlined } from '@mui/icons-material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Avatar, Menu, MenuItem, IconButton, Tooltip, Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import { supabase } from '../utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { TemaContext } from './layout'; // Importa o contexto do tema

const Sidebar = () => {
    const pathname = usePathname();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [avatarLetra, setAvatarLetra] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const { temaAtual } = useContext(TemaContext); // Utilize o tema do contexto

    useEffect(() => {
        const storedAvatarLetra = sessionStorage.getItem('avatar_letra');
        const storedAvatarUrl = sessionStorage.getItem('avatar_url') || '';

        if (storedAvatarLetra) {
            setAvatarLetra(storedAvatarLetra);
        }

        if (storedAvatarUrl && storedAvatarUrl !== '') {
            setAvatarUrl(storedAvatarUrl);
        } else {
            setAvatarUrl(null);
        }
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = '/';
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: temaAtual === 'claro' ? '#f8f9fa' : 'background.default',
                color: temaAtual === 'claro' ? 'text.primary' : 'text.secondary',
                transition: 'background-color 0.3s, color 0.3s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'fixed', // Mantém o Sidebar fixo
                height: '100vh',
                width: '80px', // Defina uma largura fixa adequada para o Sidebar
                padding: '16px',
                top: 0, // Fixa o Sidebar no topo
                left: 0, // Fixa o Sidebar à esquerda
            }}
        >
            <div className="sidebar-top" style={{ flexGrow: 1 }}>
                <div className="logo-container mb-3">
                    <Link href="/logado/dashboard">
                        <LogoDevOutlined 
                            className="sidebar-icon" 
                            sx={{ color: temaAtual === 'claro' ? '#000' : '#fff' }} // Ícone mais claro no tema escuro
                        />
                    </Link>
                </div>
                <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
                    <li className="nav-item">
                        <Tooltip title="Dashboard" placement="right">
                            <Link href="/logado/dashboard">
                                <Dashboard 
                                    className="sidebar-icon" 
                                    sx={{ color: temaAtual === 'claro' ? '#000' : '#fff' }} 
                                />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Usuários" placement="right">
                            <Link href="/logado/usuarios">
                                <AccountBoxIcon 
                                    className="sidebar-icon" 
                                    sx={{ color: temaAtual === 'claro' ? 'text.primary' : 'text.secondary' }} 
                                />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Clientes" placement="right">
                            <Link href="/logado/clientes">
                                <PeopleAlt 
                                    className="sidebar-icon" 
                                    sx={{ color: temaAtual === 'claro' ? 'text.primary' : 'text.secondary' }} 
                                />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Notas fiscais" placement="right">
                            <Link href="/logado/notas_fiscais">
                                <Article 
                                    className="sidebar-icon" 
                                    sx={{ color: temaAtual === 'claro' ? 'text.primary' : 'text.secondary' }} 
                                />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Configurações" placement="right">
                            <Link href="/logado/configuracoes">
                                <Settings 
                                    className="sidebar-icon" 
                                    sx={{ color: temaAtual === 'claro' ? 'text.primary' : 'text.secondary' }} 
                                />
                            </Link>
                        </Tooltip>
                    </li>
                </ul>
            </div>

            <div className="profile-section">
                <IconButton onClick={handleMenuOpen} size="large">
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
                        <Avatar sx={{ bgcolor: temaAtual === 'claro' ? 'primary.main' : 'secondary.main', width: 50, height: 50 }}>
                            {avatarLetra}
                        </Avatar>
                    )}
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <MenuItem onClick={() => window.location.href = '/logado/perfil'}>Perfil</MenuItem>
                    <MenuItem onClick={handleLogout}>Sair</MenuItem>
                </Menu>
            </div>
        </Box>
    );
};

export default Sidebar;
