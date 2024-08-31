'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';  // Importe o Topbar
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../estilos/globals.css';

type Tema = 'claro' | 'escuro';

export default function LogadoLayout({ children }: { children: React.ReactNode }) {
    const [temaAtual, setTemaAtual] = useState<Tema>('claro');

    useEffect(() => {
        const storedTema = (sessionStorage.getItem('tema') as Tema) || 'claro';
        setTemaAtual(storedTema);

        const handleStorageChange = () => {
            const newTema = (sessionStorage.getItem('tema') as Tema) || 'claro';
            setTemaAtual(newTema);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const theme = createTheme({
        palette: {
            mode: temaAtual === 'claro' ? 'light' : 'dark',
            primary: {
                main: temaAtual === 'claro' ? '#1976d2' : '#90caf9',
            },
            secondary: {
                main: temaAtual === 'claro' ? '#9c27b0' : '#f48fb1',
            },
            background: {
                default: temaAtual === 'claro' ? '#f8f9fa' : '#121212',
                paper: temaAtual === 'claro' ? '#ffffff' : '#1d1d1d',
            },
            text: {
                primary: temaAtual === 'claro' ? '#000000' : '#ffffff',
                secondary: temaAtual === 'claro' ? '#4f4f4f' : '#aaaaaa',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Topbar tema={temaAtual} /> {/* Passando o tema para o Topbar */}
                <div style={{ display: 'flex', flexGrow: 1 }}>
                    <Sidebar tema={temaAtual} />
                    <main style={{ flexGrow: 1, padding: '20px', marginLeft: '80px' }}>
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}



