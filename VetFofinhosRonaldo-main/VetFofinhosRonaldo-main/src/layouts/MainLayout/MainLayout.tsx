import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import '../../pages/Home.css';

const MainLayout: React.FC = () => {
  return (
    <div>
      <NavBar />
      <main style={{ paddingTop: '70px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;