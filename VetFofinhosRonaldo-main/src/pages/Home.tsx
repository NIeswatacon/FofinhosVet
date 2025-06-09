import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';

const Home: React.FC = () => {
  const navigate = useNavigate();

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
        <p className="subtitle">Cuidado, carinho e tudo para seu pet em um só lugar.</p>
        <button className="cadastre-agora-btn" onClick={() => navigate('/cadastro')}>
          Cadastre agora
        </button>
      </div>
    </div>
  );
};

export default Home; 