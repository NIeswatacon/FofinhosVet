import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import axios from 'axios';
import { API_URLS } from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setIsLoggedIn(true);
      const user = JSON.parse(userStr);
      setUserName(user.nome || null);
      // Buscar pets do usuário
      axios.get(`${API_URLS.conta}/api/contas/clientes/${user.id}/pets`)
        .then(res => {
          setHasPets(Array.isArray(res.data) && res.data.length > 0);
        })
        .catch(() => setHasPets(false));
    } else {
      setIsLoggedIn(false);
      setHasPets(null);
    }
  }, []);

  let buttonText = 'Cadastre agora';
  let buttonAction = () => navigate('/cadastro');
  let subtitle = 'Cuidado, carinho e tudo para seu pet em um só lugar.';

  if (isLoggedIn && hasPets === false) {
    buttonText = 'Cadastrar Pet';
    buttonAction = () => navigate('/cadastro-pet');
    subtitle = userName ? `Olá, ${userName}! Cadastre seu primeiro pet para começar a usar todos os serviços.` : 'Cadastre seu primeiro pet para começar a usar todos os serviços.';
  } else if (isLoggedIn && hasPets === true) {
    buttonText = 'Ver meus agendamentos';
    buttonAction = () => navigate('/agendamentos');
    subtitle = userName ? `Bem-vindo de volta, ${userName}!` : 'Bem-vindo de volta!';
  }

  return (
    <div className="home-container">
      <NavBar />
      <div className="paw-bg">
        {/* Fundo de patinhas SVG */}
        {[...Array(8)].map((_, row) => (
          [...Array(12)].map((_, col) => (
            <svg
              key={`paw-${row}-${col}`}
              className="paw-print"
              style={{
                top: `${row * 12 + (col % 2 === 0 ? 3 : 0)}%`,
                left: `${col * 8.5}%`,
                transform: `rotate(${(row * col) % 360}deg) scale(${0.7 + (col % 3) * 0.15})`,
                opacity: 0.13 + ((row + col) % 3) * 0.07,
              }}
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Almofada principal (triângulo arredondado) */}
              <path d="M27 44 Q20 38 24 28 Q34 18 44 28 Q48 38 41 44 Q34 50 27 44 Z" fill="#007BFF" />
              {/* Dedos (ovais) */}
              <ellipse cx="17" cy="20" rx="5" ry="8" fill="#007BFF" />
              <ellipse cx="37" cy="20" rx="5" ry="8" fill="#007BFF" />
              <ellipse cx="22" cy="10" rx="4" ry="6" fill="#007BFF" />
              <ellipse cx="32" cy="10" rx="4" ry="6" fill="#007BFF" />
            </svg>
          ))
        ))}
      </div>
      <div className="home-content">
        <h1>Bem-vindo ao VetFofinhos!</h1>
        <p className="subtitle">{subtitle}</p>
        <button className="cadastre-agora-btn" onClick={buttonAction}>
          {buttonText}
        </button>
        {isLoggedIn && hasPets === true && (
          <button
            className="comprar-produtos-btn"
            style={{ marginTop: 16, background: '#28a745', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
            onClick={() => navigate('/produtos')}
          >
            Comprar produtos
          </button>
        )}
      </div>
    </div>
  );
};

export default Home; 