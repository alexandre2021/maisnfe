'use client';

import React, { useState, useEffect, createContext } from 'react';
import Sidebar from './sidebar';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../estilos/globals.css';

type Tema = 'claro' | 'escuro';

interface TemaContextProps {
    temaAtual: Tema;
    setTemaAtual: (tema: Tema) => void;
}

export const TemaContext = createContext<TemaContextProps>({
    temaAtual: 'claro',
    setTemaAtual: () => { },
});

export default function LogadoLayout({ children }: { children: React.ReactNode }) {
    const [temaAtual, setTemaAtual] = useState<Tema>('claro');

    useEffect(() => {
        const storedTema = sessionStorage.getItem('tema') as Tema || 'claro';
        setTemaAtual(storedTema);

        const handleStorageChange = () => {
            const newTema = sessionStorage.getItem('tema') as Tema || 'claro';
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
                main: temaAtual === 'claro' ? '#1976d2' : '#90caf9', // Azul claro no tema escuro
            },
            secondary: {
                main: temaAtual === 'claro' ? '#9c27b0' : '#f48fb1', // Rosa claro no tema escuro
            },
            background: {
                default: temaAtual === 'claro' ? '#f8f9fa' : '#121212', // Cinza escuro no tema escuro
                paper: temaAtual === 'claro' ? '#ffffff' : '#1d1d1d', // Definindo o papel no tema escuro
            },
            text: {
                primary: temaAtual === 'claro' ? '#000000' : '#ffffff', // Branco no tema escuro
                secondary: temaAtual === 'claro' ? '#4f4f4f' : '#aaaaaa', // Cinza claro para textos secundários no tema escuro
            },
        },
    });

    return (
        <TemaContext.Provider value={{ temaAtual, setTemaAtual }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                    <Sidebar />
                    <main style={{ flexGrow: 1, padding: '20px', marginLeft: '80px' }}>
                        {children}
                    </main>
                </div>
            </ThemeProvider>
        </TemaContext.Provider>
    );
}
