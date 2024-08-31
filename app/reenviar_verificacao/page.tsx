'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import CustomModal from '../componentes/modal';
import Link from 'next/link';

export default function ReenviarVerificacao() {
    const [email, setEmail] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', isSuccess: false }); // Add this line

    const handleCloseModal = () => {
        setModalOpen(false);
        if (isSuccess) {
            window.location.href = '/login';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/reenviar_verificacao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setModalMessage(result.message || 'E-mail de verificação reenviado com sucesso!');
                setIsSuccess(true);
            } else {
                setModalMessage(result.error || 'Erro ao reenviar e-mail de verificação. Tente novamente mais tarde.');
                setIsSuccess(false);
            }
            setModalOpen(true);

        } catch (error) {
            setModalMessage('Erro no servidor. Tente novamente mais tarde.');
            setIsSuccess(false);
            setModalOpen(true);
        }
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
                    Reenviar verificação
                </Typography>
                <TextField
                    id="email"
                    label="Endereço de e-mail"
                    type="email"
                    variant="outlined"
                    fullWidth
                    required
                    sx={{ marginBottom: 2 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Reenviar
                </Button>
                <Typography
                    variant="body2"
                    sx={{
                        marginTop: 1,
                        textAlign: 'center',
                        color: '#007bff',
                    }}
                >
                    <Link href="/login" >
                        Voltar ao Login
                    </Link>
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        marginTop: 1,
                        textAlign: 'center',
                        color: '#007bff',
                    }}
                >
                    <Link href="/cadastro" >
                        Ainda não tem uma conta? Cadastre-se
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
                title={modalContent.title} // Uses modalContent here
                message={modalContent.message} // Uses modalContent here
                isSuccess={isSuccess}
            />
        </Box>
    );
}

