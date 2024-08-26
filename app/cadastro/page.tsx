'use client';

import React, { useState, FormEvent } from 'react';
import { supabase } from '../utils/supabase/client';
import CpfCnpjInput from 'react-cpf-cnpj-input';
import CustomModal from '../componentes/modal';

export default function Cadastro() {
  const [nome, setnome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cnpj, setCnpj] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptPolicies, setAcceptPolicies] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
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
    <div className="cadastro-flex-container vh-100">
      <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
        <h2 className="mb-4">Cadastre-se</h2>
        <div className="mb-3">
          <label htmlFor="nome" className="formulario-label">Responsável</label>
          <input
            type="text"
            className="formulario-elementos"
            id="nome"
            value={nome}
            onChange={(e) => setnome(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="formulario-label">Endereço de e-mail</label>
          <input
            type="email"
            className="formulario-elementos"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            required
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$"
            title="Por favor, insira um endereço de e-mail válido."
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="cnpj" className="formulario-label">CNPJ</label>
          <CpfCnpjInput
            type="cnpj"
            value={cnpj}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnpj(e.target.value)}
            className="formulario-elementos"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="formulario-label">Senha</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              className="formulario-elementos"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
            >
              👁️
            </button>
          </div>
          {passwordError && (
            <p className="error-message" style={{ fontSize: '12px', color: 'red' }}>
              {passwordError}
            </p>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="formulario-label">Confirme a Senha</label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="formulario-elementos"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onMouseUp={() => setShowConfirmPassword(false)}
              onMouseDown={() => setShowConfirmPassword(true)}
              onMouseLeave={() => setShowConfirmPassword(false)}
            >
              👁️
            </button>
          </div>
        </div>
        <div className="mb-3 formulario-checkbox-container">
          <input
            type="checkbox"
            id="acceptPolicies"
            required
            checked={acceptPolicies}
            onChange={() => setAcceptPolicies(!acceptPolicies)}
            className="formulario-checkbox"
          />
          <label htmlFor="acceptPolicies" className="formulario-checkbox-label">
            Aceito a <a href="/politica_de_privacidade" target="_blank" className="link-termos">Política de privacidade</a> e a <a href="/politica_de_uso" target="_blank" className="link-termos">Política de uso</a>
          </label>
        </div>
        <button type="submit" className="botao botaoPrimario w-100">Cadastrar</button>
        <div className="mt-3 text-center">
          <a href="/login" className="text-decoration-none">Já tem uma conta? Login</a>
        </div>
      </form>
      <div className="mt-3 text-center">
        <p className="formulario-obrigatorio-nota">* Campos obrigatórios</p>
      </div>

      <CustomModal
        open={modalOpen}
        handleClose={handleCloseModal}
        title={isSuccess ? 'Sucesso!' : 'Erro'}
        message={modalMessage}
        isSuccess={isSuccess}
      />
    </div>
  );
}

