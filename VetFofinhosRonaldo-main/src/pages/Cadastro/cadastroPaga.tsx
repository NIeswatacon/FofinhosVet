import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cadastroPaga.css';
import api, { API_URLS } from '../../services/api';
import axios from 'axios';

// Tipagem explícita para as props do Paw
interface PawProps {
  x: number;
  y: number;
  color?: string;
  size?: number;
  rotation?: number;
}

const Paw = ({ x, y, color = "#003366", size = 1, rotation = 0 }: PawProps) => (
  <g transform={`translate(${x},${y}) scale(${size}) rotate(${rotation})`}>
    <path d="M 0 20 Q -18 30 -18 50 Q 0 70 18 50 Q 18 30 0 20 Z" fill={color} />
    <ellipse rx="10" ry="16" cx="-22" cy="0" fill={color} />
    <ellipse rx="10" ry="16" cx="-7" cy="-18" fill={color} />
    <ellipse rx="10" ry="16" cx="7" cy="-18" fill={color} />
    <ellipse rx="10" ry="16" cx="22" cy="0" fill={color} />
  </g>
);

// Componente de fundo com patinhas dinâmico
const PawsBackground = () => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parâmetros do grid
  const xSpacing = 80;
  const ySpacing = 80;
  const baseX = 40;
  const baseY = 40;
  const pawColor = "#003366";
  const pawOpacity = 0.13;
  const cols = Math.ceil(dimensions.width / xSpacing) + 2;
  const rows = Math.ceil(dimensions.height / ySpacing) + 2;

  const paws = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = baseX + col * xSpacing + (row % 2 === 0 ? 16 : -16) * (col % 2);
      const y = baseY + row * ySpacing + (col % 2 === 0 ? 8 : -8) * (row % 2);
      const size = 0.45 + 0.10 * ((row + col) % 3);
      const rotation = -20 + ((row * 13 + col * 17) % 40);
      paws.push(
        <Paw
          key={`paw-${row}-${col}`}
          x={x}
          y={y}
          color={pawColor}
          size={size}
          rotation={rotation}
        />
      );
    }
  }
  return (
    <svg
      className="cadastro-bg-paws"
      width={dimensions.width}
      height={dimensions.height}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity={pawOpacity}>{paws}</g>
    </svg>
  );
};

const CadastroPaga: React.FC = () => {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('=== INÍCIO DO PROCESSO DE CADASTRO ===');
    console.log('Dados do formulário:', form);

    // Validação da senha
    if (form.senha !== form.confirmarSenha) {
      console.log('Erro: As senhas não coincidem');
      setError('As senhas não coincidem');
      return;
    }

    if (form.senha.length < 6) {
      console.log('Erro: Senha muito curta');
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      // Remove o campo confirmarSenha antes de enviar
      const { confirmarSenha, ...dadosCadastro } = form;
      
      const url = `${API_URLS.conta}/api/contas`;

      console.log('Enviando dados para a API:', dadosCadastro);
      console.log('URL da API (normalizada):', url);
      
      const response = await axios.post(url, dadosCadastro);
      
      console.log('Resposta COMPLETA da API:', response);
      console.log('Dados da Resposta da API:', response.data);
      console.log('Status da Resposta da API:', response.status);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Cadastro realizado com sucesso');
        setSubmitted(true);
        // Redireciona para a página de clientes após 2 segundos
        setTimeout(() => {
          navigate('/clientes');
        }, 2000);
      } else {
        console.error('Cadastro falhou com status inesperado:', response.status, response.data);
        setError('Erro inesperado ao realizar cadastro. Tente novamente.');
      }
    } catch (err: any) {
      console.error('=== ERRO NO CADASTRO ===');
      console.error('Erro completo (Axios):', err);
      
      if (err.response) {
        console.error('Detalhes da resposta de erro do backend:', err.response.data);
        console.error('Status da resposta de erro:', err.response.status);
        
        let errorMessage = 'Erro ao realizar cadastro. Por favor, tente novamente.';
        if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        }

        if (err.response.status === 400) {
          setError(`Dados inválidos: ${errorMessage}`);
        } else if (err.response.status === 409) {
          setError(`Conflito: ${errorMessage}`);
        } else {
          setError(`Erro do servidor (${err.response.status}): ${errorMessage}`);
        }
      } else if (err.request) {
        console.error('Erro na requisição (sem resposta do servidor):', err.request);
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando e acessível.');
      } else {
        console.error('Erro desconhecido:', err.message);
        setError('Ocorreu um erro inesperado ao tentar cadastrar.');
      }
    }
  };

  return (
    <div className="cadastro-paga-container">
      <PawsBackground />
      <form className="cadastro-paga-form" onSubmit={handleSubmit}>
        <h2>Crie sua conta</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            placeholder="Digite seu nome completo"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Digite seu e-mail"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            placeholder="Digite seu telefone"
            value={form.telefone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            placeholder="Digite seu endereço"
            value={form.endereco}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            placeholder="Digite seu CPF"
            value={form.cpf}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="senha"
              name="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(s => !s)}
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmarSenha"
              name="confirmarSenha"
              placeholder="Confirme sua senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="botoes-cadastro-row">
          <button type="submit" className="cadastro-btn">Cadastrar</button>
          <button type="button" className="voltar-login-btn" onClick={() => navigate('/login')}>Voltar para Login</button>
        </div>
        
        {submitted && (
          <div className="success-message">
            <p>Cadastro realizado com sucesso!</p>
            <p>Redirecionando para a página de clientes...</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CadastroPaga; 