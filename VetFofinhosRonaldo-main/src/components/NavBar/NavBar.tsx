import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import axios from 'axios';
import { API_URLS } from '../../services/api';

const NavBar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setIsLoggedIn(true);
      const userObj = JSON.parse(userStr);
      setUser(userObj);
      axios.get(`${API_URLS.conta}/api/contas/clientes/${userObj.id}/pets`)
        .then(res => setPets(res.data))
        .catch(() => setPets([]));
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setPets([]);
    }
  }, []);

  // Fechar popup ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setPets([]);
    setShowPopup(false);
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <NavLink to="/">VetFofinhos</NavLink>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/produtos" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Produtos
          </NavLink>
        </li>
        {isLoggedIn && user?.tipo === 'ADMIN' && (
          <li>
            <NavLink to="/clientes" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
              Clientes
            </NavLink>
          </li>
        )}
        {/* Agendamentos e Pagamento só para não-admin */}
        {!isLoggedIn || user?.tipo !== 'ADMIN' ? (
          <>
            <li>
              <NavLink to="/agendamentos" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
                Agendamentos
              </NavLink>
            </li>
            <li>
              <NavLink to="/pagamento" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
                Pagamento
              </NavLink>
            </li>
          </>
        ) : null}
        {/* Admin: link para agendamentos de todos os pets */}
        {isLoggedIn && user?.tipo === 'ADMIN' && (
          <li>
            <NavLink to="/admin-agendamentos" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
              Agendamentos
            </NavLink>
          </li>
        )}
         {/* Esconder Cadastrar Pet e Login se logado */}
         {!isLoggedIn && (
          <>
            <li>
              <NavLink to="/cadastro-pet" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
                Cadastrar Pet
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
                Login
              </NavLink>
            </li>
          </>
        )}
        {/* Botão circular de conta se logado */}
        {isLoggedIn && (
          <li>
            <button
              className={styles.accountCircle}
              onClick={() => setShowPopup(!showPopup)}
              title="Minha Conta"
            >
              {user?.nome ? user.nome[0].toUpperCase() : <span>👤</span>}
            </button>
            {showPopup && (
              <div className={styles.accountPopup} ref={popupRef}>
                <h3>Minha Conta</h3>
                <div><strong>Nome:</strong> {user?.nome}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                {user?.telefone && <div><strong>Telefone:</strong> {user.telefone}</div>}
                <hr />
                <div><strong>Meus Pets:</strong></div>
                {pets.length === 0 ? (
                  <div style={{ color: '#888', marginBottom: 8 }}>Nenhum pet cadastrado.</div>
                ) : (
                  <ul className={styles.petsList}>
                    {pets.map((pet) => (
                      <li key={pet.id}>
                        <strong>{pet.nome}</strong> ({pet.especie || 'Espécie não informada'})
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className={styles.popupBtn}
                  onClick={() => { setShowPopup(false); navigate('/cadastro-pet'); }}
                >
                  Cadastrar Pet
                </button>
                <button
                  className={styles.popupBtnLogout}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;