import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URLS } from '../services/api';
import NavBar from '../components/NavBar/NavBar';
import styles from './Agendamentos/AgendamentosPage.module.css';

interface Agendamento {
    id: number;
    data: string;
    servico: string;
    nomeFuncionario?: string;
    nomePet: string;
    nomeCliente: string;
    valorServico?: number;
    statusPagamento?: string;
}

const AdminAgendamentosPage: React.FC = () => {
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAgendamentos();
    }, []);

    const fetchAgendamentos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<Agendamento[]>(`${API_URLS.servicos}/agendamentos`);
            setAgendamentos(response.data);
        } catch (err) {
            setError('Erro ao buscar agendamentos.');
        } finally {
            setIsLoading(false);
        }
    };

    const excluirAgendamento = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
        try {
            await axios.delete(`${API_URLS.servicos}/agendamentos/${id}`);
            setAgendamentos(ags => ags.filter(a => a.id !== id));
        } catch (err) {
            alert('Erro ao excluir agendamento.');
        }
    };

    return (
        <div>
            <NavBar />
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Todos os Agendamentos (Admin)</h1>
                </header>
                <main className={styles.mainContent}>
                    <section className={styles.section}>
                        {isLoading && <p>Carregando agendamentos...</p>}
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        {!isLoading && !error && agendamentos.length === 0 && <p>Nenhum agendamento encontrado.</p>}
                        {!isLoading && !error && agendamentos.length > 0 && (
                            <ul className={styles.appointmentList}>
                                {agendamentos.map(ag => (
                                    <li key={ag.id} className={`${styles.appointmentItem} ${styles[`status${ag.statusPagamento?.toLowerCase() || 'pendente'}`]}`}>
                                        <div><strong>Pet:</strong> {ag.nomePet}</div>
                                        <div><strong>Cliente:</strong> {ag.nomeCliente}</div>
                                        <div><strong>Serviço:</strong> {ag.servico}</div>
                                        <div><strong>Data:</strong> {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                                        {ag.nomeFuncionario && <div><strong>Funcionário:</strong> {ag.nomeFuncionario}</div>}
                                        {ag.valorServico && <div><strong>Valor:</strong> R$ {ag.valorServico.toFixed(2)}</div>}
                                        <div className={styles.statusBadge}>
                                            <strong>Status:</strong> {ag.statusPagamento || 'PENDENTE'}
                                        </div>
                                        {ag.statusPagamento === 'PENDENTE' && (
                                            <button
                                                style={{
                                                    background: '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    marginTop: 8
                                                }}
                                                onClick={() => excluirAgendamento(ag.id)}
                                            >
                                                Excluir
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminAgendamentosPage; 