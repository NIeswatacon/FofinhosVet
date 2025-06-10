import React, { useState } from 'react';
import api from '../../services/api';
import styles from './CadastroForm.module.css';
import type { Usuario } from '../../types/Clientes/usuario';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';

type CadastroFormState = Pick<Usuario, 'nome' | 'cpf' | 'email' | 'senha' | 'numero'>;

export const CadastroForm = () => {
  const [formData, setFormData] = useState<CadastroFormState>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    numero: '',
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    if (!formData.nome || !formData.cpf || !formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    const userDataToSubmit = {
      ...formData,
      tipo: 'TUTOR' as Usuario['tipo'],
    };

    // Aqui seria feito o envio, mas a lógica de try/catch ficará para depois
    await api.post('/api/contas/clientes', userDataToSubmit);

    setIsLoading(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="nome" className={styles.label}>Nome Completo</label>
          <InputField
            type="text"
            placeholder="Seu nome"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="numero" className={styles.label}>Seu telefone</label>
          <InputField
            type="text"
            placeholder="Número"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <InputField
            type="email"
            placeholder="Seu email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="senha" className={styles.label}>Senha</label>
          <InputField
            type="password"
            placeholder="Senha"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="cpf" className={styles.label}>CPF</label>
          <InputField
            type="text"
            placeholder="Seu CPF (somente números)"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.buttonRow}>
        <FormButton type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </FormButton>

        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </form>
  );
};
