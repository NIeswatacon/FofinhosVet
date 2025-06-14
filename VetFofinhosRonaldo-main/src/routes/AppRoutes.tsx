import { useRoutes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login/Login";
import CadastroPaga from "../pages/Cadastro/cadastroPaga";
import CadastroPet from "../pages/Pets/CadastroPet";
import { AgendamentosPage } from "../pages/Agendamentos/AgendamentosPage";
import PagamentoComponent from "../pages/Pagamento/Pagamento";
import Cartao from "../pages/Cartao/Cartao";
import Vendas from "../pages/Vendas/Vendas"; // Importe a página de Vendas
import ClientesPage from "../pages/Clientes/ClientesPage";
// Importe o MainLayout real.
// Certifique-se de que o arquivo src/layouts/MainLayout.tsx existe
// e que o caminho de importação abaixo está correto.
import MainLayout from "../layouts/MainLayout/MainLayout";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import AdminAgendamentosPage from "../pages/AdminAgendamentosPage";

export default function AppRoutes() {
  return useRoutes([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/cadastro', element: <CadastroPaga /> },
    { path: '/cadastro-pet', element: <CadastroPet /> },
    // Use o MainLayout real para as rotas que precisam da NavBar
    {
      element: <MainLayout />, children: [
        { path: '/agendamentos', element: <AgendamentosPage /> },
        { path: '/pagamento', element: <PagamentoComponent /> },
        { path: '/cartao', element: <ErrorBoundary><Cartao /></ErrorBoundary> },
        { path: '/produtos', element: <Vendas /> },
        { path: '/clientes', element: <ClientesPage /> },
        { path: '/admin-agendamentos', element: <AdminAgendamentosPage /> },
        //  { path: '*', element: <NotFoundPage /> } // Se tiver uma página NotFound, pode ir aqui
      ]
    }
  ]);
}