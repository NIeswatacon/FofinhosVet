import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css';

const NavBar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <NavLink to="/">VetFofinhos</NavLink>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/agendamentos" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Agendamentos
          </NavLink>
        </li>
        <li>
          <NavLink to="/produtos" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Produtos
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagamento" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Pagamento
          </NavLink>
        </li>
        <li>
          <NavLink to="/clientes" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Clientes
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className={({ isActive }) => isActive ? styles.activeLink : undefined}>
            Login
          </NavLink>
        </li>
        {/* Adicione mais links como /cartao aqui se necessário */}
      </ul>
    </nav>
  );
};

export default NavBar;