'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../utils/supabase/client';
import CustomModal from '../componentes/modal';
import Link from 'next/link';

const NovaSenha = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const validatePassword = (password: string): string => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra maiúscula, 1 letra minúscula e 1 caractere especial.';
        }
        return '';
    };

    const handleSave = async () => {
        const validationMessage = validatePassword(password);
        if (validationMessage) {
            setModalTitle('Erro');
            setModalMessage(validationMessage);
            setIsSuccess(false);
            setModalOpen(true);
            return;
        }

        if (password !== confirmPassword) {
            setModalTitle('Erro');
            setModalMessage('As senhas não coincidem.');
            setIsSuccess(false);
            setModalOpen(true);
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setModalTitle('Erro');
            setModalMessage('Erro ao atualizar a senha.');
            setIsSuccess(false);
        } else {
            setModalTitle('Sucesso');
            setModalMessage('Senha atualizada com sucesso.');
            setIsSuccess(true);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }

        setModalOpen(true);
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
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
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
                        marginTop: 0
                    }}
                >
                    Definir nova senha
                </Typography>
                <TextField
                    id="new-password"
                    label="Nova senha"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(validatePassword(e.target.value));
                    }}
                    error={Boolean(passwordError)}
                    helperText={passwordError}
                    fullWidth
                    required
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    id="confirm-password"
                    label="Confirmar nova senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={password !== confirmPassword}
                    helperText={password !== confirmPassword ? 'As senhas não coincidem.' : ''}
                    fullWidth
                    required
                    sx={{ marginBottom: 3 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                        paddingTop: 1,
                        paddingBottom: 1,
                        marginBottom: 1
                    }}
                >
                    Salvar
                </Button>

                <Typography
                    variant="body2"
                    sx={{
                        marginTop: 1,
                        textAlign: 'center',
                    }}
                >
                    <Link href="/login" style={{ textDecoration: 'none', color: '#007bff' }}>
                        Voltar para o Login
                    </Link>
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        marginTop: 1,
                        textAlign: 'center',
                    }}
                >
                    <Link href="/cadastro" style={{ textDecoration: 'none', color: '#007bff' }}>
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
                title={modalTitle}
                message={modalMessage}
                isSuccess={isSuccess}
            />
        </Box>
    );
};

export default NovaSenha;



