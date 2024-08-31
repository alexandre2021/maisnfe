'use client';

import React, { useState, FormEvent } from 'react';
import { supabase } from '../utils/supabase/client';
import { Box, Typography, TextField, Button, Checkbox, Link, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import CustomModal from '../componentes/modal';
import InputMask from 'react-input-mask';


export default function Cadastro() {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cnpj, setCnpj] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [acceptPolicies, setAcceptPolicies] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleCloseModal = () => {
    setModalOpen(false);
    if (isSuccess) {
      window.location.href = '/';
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) return false;

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== Number(digits.charAt(1))) return false;

    return true;
  };

  const validatePassword = (password: string): string => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra maiúscula, 1 letra minúscula e 1 caractere especial.';
    }
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nome) {
      setModalMessage('O campo Responsável é obrigatório.');
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    if (!validateEmail(email)) {
      setModalMessage('Formato de email inválido.');
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    if (!validateCNPJ(cnpj)) {
      setModalMessage('CNPJ inválido.');
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) {
      setModalMessage(passwordValidationMessage);
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalMessage('As senhas não coincidem.');
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    if (!acceptPolicies) {
      setModalMessage('Você deve aceitar as políticas de uso e privacidade.');
      setIsSuccess(false);
      setModalOpen(true);
      return;
    }

    try {
      // Verifica se o CNPJ já está registrado na tabela empresas
      const { data: existingEmpresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id')
        .eq('cnpj', cnpj)
        .maybeSingle(); // Usa maybeSingle para retornar null se nenhum ou múltiplos registros forem encontrados

      if (existingEmpresa) {
        setModalMessage('Este CNPJ já está em uso.');
        setIsSuccess(false);
        setModalOpen(true);
        return;
      }

      if (empresaError) {
        console.error('Erro ao consultar a tabela empresas:', empresaError.message);
        if (empresaError.code !== 'PGRST116') {
          setModalMessage('Erro ao verificar o CNPJ.');
          setIsSuccess(false);
          setModalOpen(true);
          return;
        }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Por favor, tente novamente mais tarde.';
        if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Por favor, tente novamente mais tarde.';
        }
        setModalMessage(errorMessage);
        setIsSuccess(false);
        setModalOpen(true);


      } else {
        // Tentar inserir o e-mail na tabela pesquisa_cnpj
        try {
          await supabase
            .from('pesquisa_cnpj')
            .insert([{ email, cnpj, nome }]);
        } catch (insertError) {
          console.error('Erro ao inserir na tabela pesquisa_cnpj:', insertError);
        }
        setModalMessage('Cadastro realizado com sucesso. Por favor, verifique seu e-mail para confirmar o cadastro.');
        setIsSuccess(true);
        setModalOpen(true);
      }
    } catch (error) {
      setModalMessage('Erro inesperado ao concluir o cadastro.');
      setIsSuccess(false);
      setModalOpen(true);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="auto"
      flexDirection="column"
      sx={{
        padding: 1,
        maxWidth: '90vw',
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        noValidate
        sx={{
          width: 390,
          padding: 1.5, // Reduzi o padding
          borderRadius: 2,
          boxShadow: 4,
          border: '1px solid #ccc',
        }}
      >
        <Typography variant="h5"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: 1.5,
            marginTop: 0,
          }}
        >
          Cadastre-se
        </Typography>

        <TextField
          label="Responsável"
          variant="outlined"
          fullWidth
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-root': {
              padding: '0.8px', // Reduz a altura do input
            },
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem', // Opcional: diminuir o tamanho da fonte para melhor ajuste
            },
          }}
        />

        <TextField
          label="Endereço de e-mail"
          type="email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          error={!!emailError}
          helperText={emailError}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-root': {
              padding: '0.8px',
            },
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
            },
          }}
        />
        <TextField
          label="CNPJ"
          variant="outlined"
          fullWidth
          required
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          /* o inputProps precisa ficar dentro do textField */
          InputProps={{
            inputComponent: InputMask as any,
            inputProps: { mask: '99.999.999/9999-99' },
          }}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-root': {
              padding: '0.8px',
            },
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
            },
          }}
        />
        <TextField
          label="Senha"
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(validatePassword(e.target.value));
          }}
          error={Boolean(passwordError)}
          helperText={passwordError}
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
          sx={{ marginBottom: 3 }}
        />

        <TextField
          label="Confirme a Senha"
          variant="outlined"
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={password !== confirmPassword}
          helperText={password !== confirmPassword ? 'As senhas não coincidem.' : ''}
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
          sx={{ marginBottom: 1.5 }}
        />

        <Box display="flex" alignItems="center" mb={1.5}>
          <Checkbox
            checked={acceptPolicies}
            onChange={() => setAcceptPolicies(!acceptPolicies)}
            required
            sx={{ marginRight: 0 }}
          />
          <Typography variant="body2">
            Aceito <Link href="/politica_de_privacidade" target="_blank">Política de privacidade</Link> e <Link href="/termo_de_uso" target="_blank">Termo de uso</Link>
            <span style={{ color: 'gray', marginLeft: '3px' }}>*</span>
          </Typography>
        </Box>


        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1 }}>
          Cadastrar
        </Button>

        <Typography variant="body2" align="center" mt={1.5}>
          <Link href="/login">Já tem uma conta? Login</Link>
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: 'gray',
          textAlign: 'center',
          marginTop: 1.5,
        }}
      >
        * campo obrigatório
      </Typography>

      <CustomModal
        open={modalOpen}
        handleClose={handleCloseModal}
        title={isSuccess ? 'Sucesso!' : 'Erro'}
        message={modalMessage}
        isSuccess={isSuccess}
      />



    </Box>
  );
}

