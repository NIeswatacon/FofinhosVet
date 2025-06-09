import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar'; // Descomente e certifique-se que o caminho está correto

const MainLayout: React.FC = () => {
  return (
    <div>
      <NavBar /> {/* Use o componente NavBar real */}
      <main style={{ paddingTop: '70px' }}> {/* Ajuste este valor conforme a altura da sua NavBar */}
        {/* O conteúdo das rotas aninhadas (Agendamentos, Produtos, etc.) será renderizado aqui */}
        <Outlet />
      </main>
      {/* Você pode adicionar um Footer aqui se desejar, que também apareceria em todas essas páginas */}
    </div>
  );
};

export default MainLayout;