'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Button } from '@mui/material';
import { supabase } from '../utils/supabase/client';
import CustomModal from '../componentes/modal';

const NovaSenha = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', isSuccess: false });
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');

        if (!token || !email) {
            router.push('/login');
            return;
        }

        const verifyToken = async () => {
            const { error } = await supabase.auth.verifyOtp({
                type: 'recovery',
                token,
                email,
            });

            if (error) {
                console.error('Erro ao verificar o token:', error);
                router.push('/login');
            }
        };

        verifyToken();
    }, [router]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setModalContent({
                title: 'Erro',
                message: 'As senhas não coincidem.',
                isSuccess: false,
            });
            setModalOpen(true);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            setModalContent({
                title: 'Erro',
                message: 'Erro ao atualizar a senha.',
                isSuccess: false,
            });
        } else {
            setModalContent({
                title: 'Sucesso',
                message: 'Senha atualizada com sucesso.',
                isSuccess: true,
            });
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }

        setModalOpen(true);
    };

    return (
        <Box sx={{ width: '700px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px' }}>Redefinir Senha</Typography>
            <TextField
                label="Nova Senha"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Confirmar Nova Senha"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: '20px' }}
                onClick={handleUpdatePassword}
            >
                Salvar Nova Senha
            </Button>

            <CustomModal
                open={modalOpen}
                handleClose={() => setModalOpen(false)}
                title={modalContent.title}
                message={modalContent.message}
                isSuccess={modalContent.isSuccess}
            />
        </Box>
    );
};

export default NovaSenha;



