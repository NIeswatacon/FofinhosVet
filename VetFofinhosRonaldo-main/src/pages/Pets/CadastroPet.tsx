import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NavBar from '../../components/NavBar/NavBar';
import '../Cadastro/cadastroPaga.css'; // Corrigido para o nome do arquivo CSS existente

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

    // Validação básica
    if (!formData.nome || !formData.especie || !formData.raca || !formData.dataNascimento) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      console.log('=== INÍCIO DO CADASTRO DE PET NO FRONTEND ===');
      console.log('Dados do Pet:', formData);

      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;

      if (!userId) {
        setError('ID do usuário não encontrado. Por favor, faça login novamente.');
        console.error('Erro: ID do usuário não encontrado para cadastro de pet.');
        return;
      }

      console.log('Enviando requisição para:', '/api/contas/clientes/me/pets');
      const response = await api.post('/api/contas/clientes/me/pets', formData, {
        headers: {
          'X-User-ID': userId,
        },
      });

      console.log('Resposta recebida:', response.data);

      if (response.status === 201) {
        setSuccess('Pet cadastrado com sucesso!');
        setFormData({ nome: '', especie: '', raca: '', dataNascimento: '', }); // Limpa o formulário
        navigate('/clientes'); // Ou para uma página de listagem de pets
      } else {
        setError('Erro ao cadastrar o pet. Tente novamente.');
        console.error('Erro na resposta do servidor:', response.data);
      }
    } catch (err: any) {
      console.error('=== ERRO NO CADASTRO DE PET ===');
      console.error('Erro completo:', err);
      if (err.response) {
        console.error('Dados da resposta:', err.response.data);
        console.error('Status da resposta:', err.response.status);
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Erro ao cadastrar o pet. Verifique os dados e tente novamente.');
        }
      } else if (err.request) {
        setError('Erro de conexão: O servidor não respondeu.');
      } else {
        setError('Erro inesperado: ' + err.message);
      }
    }
  };

  return (
    <div className="cadastro-container">
      <NavBar />
      <div className="cadastro-form-section">
        <h1 className="cadastro-title">Cadastrar Novo Pet</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="cadastro-form">
          <label htmlFor="nome">Nome do Pet</label>
          <input
            id="nome"
            type="text"
            name="nome"
            placeholder="Nome do seu pet"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <label htmlFor="especie">Espécie</label>
          <input
            id="especie"
            type="text"
            name="especie"
            placeholder="Ex: Cachorro, Gato, Pássaro"
            value={formData.especie}
            onChange={handleChange}
            required
          />

          <label htmlFor="raca">Raça</label>
          <input
            id="raca"
            type="text"
            name="raca"
            placeholder="Ex: Labrador, Siamês, Calopsita"
            value={formData.raca}
            onChange={handleChange}
            required
          />

          <label htmlFor="dataNascimento">Data de Nascimento</label>
          <input
            id="dataNascimento"
            type="date"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
          />

          <div className="button-group">
            <button type="submit" className="cadastro-btn">Cadastrar Pet</button>
            <button type="button" onClick={() => navigate('/clientes')}>Voltar</button>
          </div>
        </form>
      </div>
      {/* Pode adicionar uma seção de informações de pet semelhante à de login/cadastro de usuário */}
      <div className="cadastro-info-section">
        <h2>Cuidar do seu pet ficou ainda mais fácil!</h2>
        <p>
          Adicione seu pet para gerenciar agendamentos, histórico de serviços e muito mais.
        </p>
      </div>
    </div>
  );
};

export default CadastroPet; 