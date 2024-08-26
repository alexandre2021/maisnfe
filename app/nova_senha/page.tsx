'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../utils/supabase/client';
import CustomModal from '../componentes/modal'; // Certifique-se de ajustar o caminho conforme necessário

const NovaSenha = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', isSuccess: false });
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        document.body.style.backgroundColor = '#f8f9fa';
        const bodyDiv = document.querySelector('body > div');
        if (bodyDiv) {
            //bodyDiv.style.backgroundColor = '#f8f9fa';
        }

        // Verifica a sessão de autenticação
        const checkSession = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email'); // Obtém o e-mail dos parâmetros de consulta
            if (token && email) {
                const { error, data } = await supabase.auth.verifyOtp({
                    type: 'recovery',
                    token,
                    email,
                });
                if (error) {
                    //ocorre quando o token de redefinição de senha expirou (normalmente dura 1 hora) ou é inválido
                    console.error('Erro ao verificar o token:', error);
                    router.push('/login'); // Redireciona para a página de login se a verificação falhar
                } else {
                    if (data.user) {


                        // Obtenha o horário do servidor do Supabase
                        // Isso é necessário para verificar se o token de redefinição de senha está dentro da janela de tempo permitida
                        //rpc: get_server_time é uma função personalizada criada no Supabase que retorna o horário do servidor
                        const { data: serverTimeData, error: serverTimeError } = await supabase.rpc('get_server_time');
                        if (serverTimeError) {
                            console.error('Erro ao obter o horário do servidor:', serverTimeError);
                            router.push('/login'); // Redireciona para a página de login se houver erro ao obter o horário do servidor
                            return;
                        }

                        const serverTime = new Date(serverTimeData);

                        // Obtenha o fuso horário do usuário
                        const userTimeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000; // Offset em milissegundos
                        const localTime = new Date(serverTime.getTime() - userTimeZoneOffset); // Ajuste o fuso horário

                        const currentTime = Math.floor(localTime.getTime() / 1000);
                        const tokenIssuedAt = data.user.created_at; // Supondo que o campo created_at está disponível

                        // Calcule a diferença de tempo entre o horário atual e o horário do token emitido
                        const timeDifference = Math.abs(currentTime - new Date(tokenIssuedAt).getTime() / 1000);

                        // Ajuste a janela de tempo permitida (em segundos)
                        const allowedTimeWindow = 3600; // 1 hora

                        if (timeDifference <= allowedTimeWindow) {
                            console.log('Sessão atual:', data);
                            // Redirecionar para a página de redefinição de senha ou apropriada
                            router.push('/nova_senha');
                        } else {
                            console.error('Token fora da janela de tempo permitida');
                            router.push('/login'); // Redireciona para a página de login se o token estiver fora da janela de tempo
                        }
                    } else {
                        console.error('Usuário não encontrado');
                        router.push('/login'); // Redireciona para a página de login se o usuário não for encontrado
                    }
                }
            } else {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Erro ao obter a sessão:', error);
                } else {
                    console.log('Sessão atual:', session);
                    if (!session) {
                        router.push('/login'); // Redireciona para a página de login se a sessão estiver ausente
                    }
                }
            }
        };

        checkSession();
    }, [router, searchParams]);

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault();

    const validatePassword = (password: string): string => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra maiúscula, 1 letra minúscula e 1 caractere especial.';
        }
        return '';
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setNewPassword(password);
        const validationMessage = validatePassword(password);
        setPasswordError(validationMessage);
    };

    const handleUpdatePassword = async () => {
        const validationMessage = validatePassword(newPassword);
        if (validationMessage) {
            setModalContent({
                title: 'Erro',
                message: validationMessage,
                isSuccess: false,
            });
            setModalOpen(true);
            return;
        }

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
            console.error('Erro ao atualizar a senha:', error.message); // Adiciona log de erro para depuração
            setModalContent({
                title: 'Erro',
                message: `Erro ao atualizar a senha: ${error.message}`, // Inclui a mensagem de erro do Supabase
                isSuccess: false,
            });
        } else {
            setModalContent({
                title: 'Sucesso',
                message: 'Senha atualizada com sucesso.',
                isSuccess: true,
            });
            // Redireciona para a página de login após um curto atraso
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }

        setModalOpen(true);
    };

    return (
        <Box sx={{ width: '700px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Typography variant="h4" sx={{ marginBottom: '20px', color: '#1976d2' }}>Redefinir Senha</Typography>
            <TextField
                label="Nova Senha"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={newPassword}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <TextField
                label="Confirmar Nova Senha"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
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