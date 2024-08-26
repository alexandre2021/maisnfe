'use client';

import React, { useState } from 'react';
import CustomModal from '../componentes/modal';

export default function ReenviarVerificacao() {
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
        <div className="reenviar-verificacao-container">
            <form className="reenviar-verificacao-form" onSubmit={handleSubmit}>
                <h2 className="mb-4">Reenviar Verificação</h2>
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
                <button type="submit" className="botao botaoPrimario w-100">Reenviar</button>
                <div className="mt-3 text-center">
                    <a href="/login" className="text-decoration-none">Voltar ao Login</a>
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
