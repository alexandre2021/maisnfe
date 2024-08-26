'use client';

import React, { useState } from 'react';
import CustomModal from '../componentes/modal'; // Usando a CustomModal já criada

export default function EsqueciMinhaSenha() {
    const [email, setEmail] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const handleCloseModal = () => {
        setModalOpen(false);
        if (isSuccess) {
            window.location.href = '/login';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/esqueci_minha_senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setModalMessage(result.message || 'E-mail de recuperação de senha enviado com sucesso!');
                setIsSuccess(true);
            } else {
                setModalMessage(result.error || 'Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.');
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
        <div className="esqueci-senha-container">
            <form className="esqueci-senha-form" onSubmit={handleSubmit}>
                <h2 className="mb-4">Recuperar Senha</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="formulario-label">Endereço de e-mail</label>
                    <input
                        type="email"
                        className="formulario-elementos"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="botao botaoPrimario w-100">Enviar</button>
                <div className="mt-3 text-center">
                    <a href="/login" className="text-decoration-none">Voltar para o Login</a>
                </div>
                <div className="mt-3 text-center">
                    <a href="/cadastro" className="text-decoration-none">Ainda não tem uma conta? Cadastre-se</a>
                </div>
            </form>

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

