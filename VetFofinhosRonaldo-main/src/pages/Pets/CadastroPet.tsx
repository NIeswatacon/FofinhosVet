// src/pages/Pet/CadastroPet.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_URLS } from '../../services/api';
import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar';
import './CadastroPet.css';

// Criando uma instância do axios específica para o serviço de pets
const petApi = axios.create({
  baseURL: API_URLS.conta,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface PetData {
  nome: string;
  especie: string;
  raca: string;
  dataNascimento: string;
}

const CadastroPet: React.FC = () => {
  const [formData, setFormData] = useState<PetData>({
    nome: '',
    especie: '',
    raca: '',
    dataNascimento: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.nome || !formData.especie || !formData.raca || !formData.dataNascimento) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const userJson = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userJson || !token) {
        setError('Usuário não autenticado. Faça login novamente.');
        return;
      }

      const user = JSON.parse(userJson);
      const clienteId = user.id;

      console.log('Enviando dados do pet para a API:', formData);
      const response = await petApi.post(`/api/contas/clientes/${clienteId}/pets`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Resposta COMPLETA da API de pet:', response);
      console.log('Status da Resposta da API de pet:', response.status);
      console.log('Dados da Resposta da API de pet:', response.data);

      if (response.status === 201 || response.status === 200) {
        setSuccess('Pet cadastrado com sucesso!');
        setFormData({ nome: '', especie: '', raca: '', dataNascimento: '' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Erro ao cadastrar o pet. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar o pet:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Não autorizado. Faça login novamente.');
      } else {
        setError('Erro inesperado. Verifique os dados e tente novamente.');
      }
    }
  };

  return (
    <div className="cadastro-pet-container">
      <NavBar />
      <div className="cadastro-pet-form-section">
        <h1 className="cadastro-pet-title">Cadastrar Novo Pet</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="cadastro-pet-form">
          <label htmlFor="nome">Nome do Pet</label>
          <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required />

          <label htmlFor="especie">Espécie</label>
          <input type="text" id="especie" name="especie" value={formData.especie} onChange={handleChange} required />

          <label htmlFor="raca">Raça</label>
          <input type="text" id="raca" name="raca" value={formData.raca} onChange={handleChange} required />

          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />

          <div className="button-group">
            <button type="submit" className="cadastro-pet-btn">Cadastrar Pet</button>
          </div>
        </form>
      </div>

      <div className="cadastro-pet-info-section">
        <h2>Cuidar do seu pet ficou ainda mais fácil!</h2>
        <p>Adicione seu pet para gerenciar agendamentos, histórico de serviços e muito mais.</p>
      </div>
    </div>
  );
};

export default CadastroPet;
