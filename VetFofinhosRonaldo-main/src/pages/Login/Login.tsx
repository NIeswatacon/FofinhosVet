import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import '../Home.css';
import NavBar from '../../components/NavBar/NavBar';
import api, { API_URLS } from '../../services/api';
import axios from 'axios';

const PawsBackground = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    function updateSize() {
      const el = document.querySelector('.login-info-section');
      if (el) {
        setDimensions({ width: el.clientWidth, height: el.clientHeight });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;
  const rows = Math.ceil(height / 55);
  const cols = Math.ceil(width / 55);
  const xSpacing = width / cols;
  const ySpacing = height / rows;
  const baseX = xSpacing / 2;
  const baseY = ySpacing / 2;
  const pawColor = "#003366";
  const pawOpacity = 0.22;

  const paws = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = baseX + col * xSpacing;
      const y = baseY + row * ySpacing;
      const size = 0.45 + 0.09 * ((row + col) % 3);
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
    <svg className="login-bg-paws" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity={pawOpacity}>{paws}</g>
    </svg>
  );
};

// Patinha igual ao exemplo: almofada path e 4 dedos ovais
const Paw = ({ x, y, color = "#003366", size = 1, rotation = 0 }: { x: number; y: number; color?: string; size?: number; rotation?: number }) => (
  <g transform={`translate(${x},${y}) scale(${size}) rotate(${rotation})`}>
    {/* Almofada principal: path SVG (triângulo arredondado) */}
    <path d="M 0 20 Q -18 30 -18 50 Q 0 70 18 50 Q 18 30 0 20 Z" fill={color} />
    {/* Quatro dedos ovais, bem espaçados */}
    <ellipse rx="10" ry="16" cx="-22" cy="0" fill={color} />
    <ellipse rx="10" ry="16" cx="-7" cy="-18" fill={color} />
    <ellipse rx="10" ry="16" cx="7" cy="-18" fill={color} />
    <ellipse rx="10" ry="16" cx="22" cy="0" fill={color} />
  </g>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('=== INÍCIO DO LOGIN NO FRONTEND ===');
    console.log('Email:', email);
    console.log('Senha:', senha);

    try {
      // Faz a requisição de login usando a URL específica do serviço de conta
      console.log('Enviando requisição para:', `${API_URLS.conta}/api/contas/auth/login`);
      const response = await axios.post(`${API_URLS.conta}/api/contas/auth/login`, {
        email,
        senha
      });

      console.log('Resposta recebida:', response.data);

      // Se o login for bem-sucedido, salva o token
      if (response.data && response.data.token) {
        console.log('Token recebido, salvando no localStorage');
        localStorage.setItem('token', response.data.token);
        // Decodifica o token para obter informações do usuário
        const tokenData = JSON.parse(atob(response.data.token.split('.')[1]));
        console.log('Dados do token:', tokenData);
        localStorage.setItem('user', JSON.stringify({
          id: tokenData.sub,
          email: tokenData.email,
          nome: tokenData.nome,
          tipo: tokenData.tipo
        }));

        // --- Lógica para verificar pets e redirecionar ---
        const userId = tokenData.sub; // O ID do usuário está no 'sub' do token
        try {
          const petsResponse = await api.get(`/api/contas/clientes/${userId}/pets`, {
            headers: {
              'X-User-ID': userId, // Passar o ID do usuário logado no cabeçalho
            },
          });
          
          if (petsResponse.data && petsResponse.data.length === 0) {
            console.log('Usuário não possui pets, redirecionando para cadastro de pet.');
            navigate('/cadastro-pet');
          } else {
            console.log('Usuário possui pets, redirecionando para clientes.');
            navigate('/clientes');
          }
        } catch (petError) {
          console.error('Erro ao verificar pets do usuário após login:', petError);
          // Em caso de erro ao verificar pets, redireciona para clientes por segurança
          navigate('/clientes');
        }
        // --- Fim da lógica de verificação de pets ---

      } else {
        console.error('Resposta inválida:', response.data);
        setError('Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.error('=== ERRO NO LOGIN ===');
      console.error('Erro completo:', err);
      if (err.response) {
        console.error('Dados da resposta:', err.response.data);
        console.error('Status da resposta:', err.response.status);
      }
      setError('Email ou senha inválidos. Por favor, tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <NavBar />
      <div className="login-form-section">
        <h1 className="login-title">Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email">E-mail ou CPF/CNPJ</label>
          <input
            id="email"
            type="text"
            placeholder="Digite seu e-mail ou CPF/CNPJ"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor="senha">Senha</label>
          <div className="password-input-wrapper">
            <input
              id="senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
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
          <div className="login-links">
            <a href="#" className="forgot-password">Esqueci a senha</a>
          </div>
          <div className="button-group">
            <button type="submit" className="login-btn">ENTRAR</button>
            <button type="button" onClick={() => navigate('/')}>Voltar para Home</button>
          </div>
        </form>
        <div className="divider"><span>Acesso Rápido</span></div>
      </div>
      <div className="login-info-section">
        <PawsBackground />
        <div className="login-info-content">
          <h2>Criar uma conta é rápido, fácil e gratuito!</h2>
          <p>
            Com a sua conta você tem acesso a ofertas exclusivas, descontos, pode criar e gerenciar sua assinatura, acompanhar seus pedidos e muito mais!
          </p>
          <button className="create-account-btn" onClick={() => navigate('/cadastro')}>Criar minha conta</button>
        </div>
      </div>
    </div>
  );
};

export default Login; 