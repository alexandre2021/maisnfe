'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';
import CircularProgress from '@mui/material/CircularProgress';

const Clientes = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                setIsAuthenticated(false);
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isAuthenticated === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Clientes</h1>
            {/* Adicione aqui o conteúdo específico da página de clientes */}
        </div>
    );
};

export default Clientes;
