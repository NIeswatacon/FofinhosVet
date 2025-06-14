import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import './ClientesPage.css';
import api, { API_URLS } from '../../services/api';
import axios from 'axios';

interface Cliente {
  id: number;
  cpf: string;
  data_cadastro: string;
  email: string;
  endereco: string;
  nome: string;
  telefone: string;
  senha: string;
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de clientes...');
      const response = await axios.get<Cliente[]>(`${API_URLS.conta}/api/contas/clientes`);
      console.log('Resposta da API:', response.data);
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', dataString);
      return dataString;
    }
  };

  const formatarCPF = (cpf: string) => {
    try {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } catch (error) {
      console.error('Erro ao formatar CPF:', cpf);
      return cpf;
    }
  };

  const formatarTelefone = (telefone: string) => {
    try {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } catch (error) {
      console.error('Erro ao formatar telefone:', telefone);
      return telefone;
    }
  };

  const excluirCliente = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await axios.delete(`${API_URLS.conta}/api/contas/${id}`);
      setClientes(clientes.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao excluir cliente.');
    }
  };

  return (
    <div className="clientes-container">
      <NavBar />
      <div className="clientes-content">
        <h1>Gerenciamento de Clientes</h1>

        {loading && <div className="loading">Carregando clientes...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && clientes.length === 0 && (
          <div className="no-data-message">Nenhum cliente encontrado.</div>
        )}

        {!loading && !error && clientes.length > 0 && (
          <div className="table-container">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.nome}</td>
                    <td>{formatarCPF(cliente.cpf)}</td>
                    <td>{cliente.email}</td>
                    <td>{formatarTelefone(cliente.telefone)}</td>
                    <td>{cliente.endereco}</td>
                    <td>{formatarData(cliente.data_cadastro)}</td>
                    <td>
                      <button style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }} onClick={() => excluirCliente(cliente.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientesPage; 