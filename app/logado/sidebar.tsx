import React from 'react';
import { Dashboard, PeopleAlt, Article, Settings, LogoDevOutlined, AccountBox, ExitToApp } from '@mui/icons-material'; // Certifique-se de que o ExitToApp está importado
import { Tooltip, Box, IconButton } from '@mui/material';
import Link from 'next/link';
import { supabase } from '../utils/supabase/client'; // Importe o Supabase

type SidebarProps = {
    tema: 'claro' | 'escuro';
};

const Sidebar: React.FC<SidebarProps> = ({ tema }) => {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = '/';
        } else {
            console.error('Erro ao fazer logout:', error.message);
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: tema === 'claro' ? '#f8f9fa' : '#121212',
                color: tema === 'claro' ? '#000000' : '#ffffff',
                transition: 'background-color 0.3s, color 0.3s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'fixed',
                height: '100vh',
                width: '80px',
                padding: '16px',
                top: 0,
                left: 0,
            }}
        >
            <div className="sidebar-top" style={{ flexGrow: 1 }}>
                <div className="logo-container mb-3">
                    <Link href="/logado/dashboard">
                        <LogoDevOutlined className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                    </Link>
                </div>
                <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
                    <li className="nav-item">
                        <Tooltip title="Dashboard" placement="right">
                            <Link href="/logado/dashboard">
                                <Dashboard className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Usuários" placement="right">
                            <Link href="/logado/usuarios">
                                <AccountBox className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Clientes" placement="right">
                            <Link href="/logado/clientes">
                                <PeopleAlt className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Notas fiscais" placement="right">
                            <Link href="/logado/notas_fiscais">
                                <Article className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </Link>
                        </Tooltip>
                    </li>
                    <li className="nav-item">
                        <Tooltip title="Configurações" placement="right">
                            <Link href="/logado/configuracoes">
                                <Settings className="sidebar-icon" sx={{ color: tema === 'claro' ? '#000' : '#fff' }} />
                            </Link>
                        </Tooltip>
                    </li>
                </ul>
            </div>

            {/* Botão de Logout */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip title="Logout" placement="right">
                    <IconButton size="large" onClick={handleLogout} sx={{ color: tema === 'claro' ? '#000' : '#fff' }}>
                        <ExitToApp />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default Sidebar;
