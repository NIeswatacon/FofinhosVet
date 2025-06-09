import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import styles from './AgendamentosPage.module.css'; // Verifique o nome real do seu arquivo .css
import NavBar from '../../components/NavBar/NavBar';
// URLs base das APIs
const API_AGENDAMENTOS_BASE_URL = 'http://localhost:8080'; // Seu backend local de Agendamentos
const API_CONTAS_BASE_URL = 'http://localhost:8082/api/contas'; // Seu microserviço de Contas (AJUSTE A PORTA)

const LOGGED_IN_CLIENT_ID = 1; // Exemplo: Cliente com ID 1

export const ServicoEnumFrontend = {
  BANHO: "BANHO",
  TOSA: "TOSA",
  CONSULTA: "CONSULTA",
} as const;
export type ServicoEnumFrontend = typeof ServicoEnumFrontend[keyof typeof ServicoEnumFrontend];

export interface Agendamento {
  id: number;
  data: string; // Formato YYYY-MM-DD
  servico: string; // Nome do enum, ex: "BANHO"
  nomeFuncionario?: string;
  nomePet: string;
  nomeCliente: string;
  valorServico?: number;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cpf: string;
  dataCadastro?: string;
}

interface Pet {
  id: number; // Mudou de id_pet para id
  nome: string;
  especie?: string;
  raca?: string;
  dataNascimento?: string; // LocalDate será string
  observacoes?: string;
  // cliente_id não é necessário no frontend se buscamos pets por /clientes/{id}/pets
}

export const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loggedInCliente, setLoggedInCliente] = useState<Cliente | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIdForDropdown, setSelectedPetIdForDropdown] = useState<string>('');
  const [formData, setFormData] = useState({ // Ajustado para o que será enviado ao backend de agendamento
    nomeCliente: '', // Será preenchido com loggedInCliente.nome
    petNome: '',
    servico: ServicoEnumFrontend.BANHO, // Valor inicial
    data: '', // YYYY-MM-DD
    dataHoraInput: '', // Para o input datetime-local
    nomeFuncionario: '', // Opcional
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para o loading do submit
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAgendamentos = async () => {
    if (!loggedInCliente) return;
    setIsLoading(true);
    setError(null);
    try {
        // O backend local de agendamentos lista todos. Filtramos no frontend.
      const response = await axios.get<Agendamento[]>(`${API_AGENDAMENTOS_BASE_URL}/agendamentos`);
      const agendamentosDoCliente = response.data.filter(
        ag => ag.nomeCliente === loggedInCliente.nome
      );
      setAgendamentos(agendamentosDoCliente);
    } catch (err) {
      setError('Falha ao buscar agendamentos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

    const fetchLoggedInClienteData = async () => {
    if (!LOGGED_IN_CLIENT_ID) {
      setError("ID do cliente logado não definido.");
      setLoggedInCliente(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get<Cliente>(`${API_CONTAS_BASE_URL}/clientes/${LOGGED_IN_CLIENT_ID}`);
      setLoggedInCliente(response.data);
      // Pré-preenche nomeCliente no formData
      setFormData(prev => ({ ...prev, nomeCliente: response.data.nome }));
    } catch (err) {
      setError(`Falha ao buscar dados do cliente ID: ${LOGGED_IN_CLIENT_ID}. Verifique se o cliente existe e o microserviço de Contas está rodando.`);
      console.error(err);
      setLoggedInCliente(null);
    } finally {
      setIsLoading(false);
    }
  };

   const fetchPetsDoCliente = async (clienteId: number) => {
       if (!clienteId) {
      setPets([]);
      setSelectedPetIdForDropdown('');
      setFormData(prev => ({ ...prev, petNome: '' }));
    }
    try {
      const response = await axios.get<Pet[]>(`${API_CONTAS_BASE_URL}/clientes/${clienteId}/pets`);
      setPets(response.data);
      // Limpa a seleção de pet anterior se a lista de pets mudar
      setSelectedPetIdForDropdown('');
      setFormData(prev => ({ ...prev, petNome: '' }));
      // if (response.data.length > 0) {
      //   // Opcional: pré-selecionar o primeiro pet
      // }
    } catch (err) {
      setError(`Falha ao buscar pets para o cliente ${clienteId}. Verifique o microserviço de Contas.`);
      console.error('Erro ao buscar pets:', err);
      setPets([]);
    }
    };

      useEffect(() => {
    fetchLoggedInClienteData();
  }, [LOGGED_IN_CLIENT_ID]); // Dependência no ID do cliente logado

   useEffect(() => {
        if (loggedInCliente && loggedInCliente.id) {
      fetchPetsDoCliente(loggedInCliente.id);
      fetchAgendamentos(); // fetchAgendamentos usará loggedInCliente.nome para filtrar
    } else {
      setPets([]);
      setSelectedPetIdForDropdown('');
      setFormData(prev => ({ ...prev, petNome: '' }));
      setAgendamentos([]);
    }
  }, [loggedInCliente]); // Depende do cliente logado

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
        if (name === 'dataHoraInput') {
      setFormData(prev => ({ ...prev, dataHoraInput: value, data: value ? value.split('T')[0] : '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePetSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const petId = e.target.value;
    setSelectedPetIdForDropdown(petId);
    const selectedPet = pets.find(p => p.id.toString() === petId);
    setFormData(prev => ({
      ...prev,
      petNome: selectedPet ? selectedPet.nome : ''
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    if (!loggedInCliente || !formData.nomeCliente || !formData.petNome || !formData.servico || !formData.data ) {
      setError('Por favor, preencha todos os campos obrigatórios (Pet, Serviço, Data). Cliente deve estar carregado.');
      setIsSubmitting(false);
      return;
    }

   const payload = {
      nomeCliente: formData.nomeCliente,
      nomePet: formData.petNome,
      servico: formData.servico,
      data: formData.data,
      nomeFuncionario: formData.nomeFuncionario || undefined, // Envia undefined se vazio
    };

    try {
      await axios.post(`${API_AGENDAMENTOS_BASE_URL}/agendamentos`, payload);
      setSuccessMessage('Agendamento criado com sucesso!');
      setFormData({
        nomeCliente: loggedInCliente?.nome || '',
        petNome: '',
        servico: ServicoEnumFrontend.BANHO,
        data: '',
        dataHoraInput: '',
        nomeFuncionario: '',
      });
      setSelectedPetIdForDropdown('');
      if (loggedInCliente?.id) {
        fetchAgendamentos(); // Re-busca os agendamentos
      }
    } catch (err) {
      setError('Falha ao criar agendamento. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!loggedInCliente && isLoading) {
    return <div className={styles.container}><p>Carregando dados do cliente...</p></div>;
  }

  if (!loggedInCliente && !isLoading && error) {
    return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  }

  if (!loggedInCliente) {
    // Poderia ser uma mensagem mais amigável ou redirecionamento para login
    return <div className={styles.container}><p>Não foi possível carregar os dados do cliente. Tente recarregar a página ou contate o suporte.</p></div>;
  }


  return (
    <div>
      <NavBar />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Agendamentos</h1>
          <p>Gerencie os agendamentos para o cliente: <strong>{loggedInCliente.nome}</strong> (CPF: {loggedInCliente.cpf || 'N/A'})</p>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.section}>
            <h2>Novo Agendamento para {loggedInCliente.nome}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="selectedPetParaAgendamento">Pet:</label>
                <select
                  name="selectedPetParaAgendamento"
                  id="selectedPetParaAgendamento"
                  value={selectedPetIdForDropdown}
                  onChange={handlePetSelectChange}
                  required
                  disabled={pets.length === 0 || !loggedInCliente}
                >
                  <option value="" disabled>{pets.length === 0 ? "Nenhum pet cadastrado" : "Selecione um pet"}</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id.toString()}>{pet.nome} (Espécie: {pet.especie || 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="servico">Serviço:</label>
                <select name="servico" id="servico" value={formData.servico} onChange={handleInputChange} required>
                  {Object.values(ServicoEnumFrontend).map(s => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dataHoraInput">Data e Hora:</label>
                <input type="datetime-local" name="dataHoraInput" id="dataHoraInput" value={formData.dataHoraInput} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="nomeFuncionario">Funcionário (opcional):</label>
                <input type="text" name="nomeFuncionario" id="nomeFuncionario" value={formData.nomeFuncionario} onChange={handleInputChange} />
              </div>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Agendando...' : 'Agendar'}
              </button>
              {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
              {error && <p className={styles.errorMessage}>{error}</p>}
            </form>
          </section>

          <section className={styles.section}>
            <h2>Próximos Agendamentos</h2>
            {isLoading && agendamentos.length === 0 && <p>Carregando agendamentos...</p>}
            {error && !isLoading && agendamentos.length === 0 && <p className={styles.errorMessage}>{error.includes("agendamentos") || error.includes("cliente") ? error : "Falha ao carregar agendamentos."}</p>}
            {!isLoading && !error && agendamentos.length === 0 && <p>Nenhum agendamento encontrado.</p>}
            {!isLoading && !error && agendamentos.length > 0 && (
              <ul className={styles.appointmentList}>
                {agendamentos.map(ag => (
                  <li key={ag.id} className={styles.appointmentItem}>
                    <div><strong>Pet:</strong> {ag.nomePet}</div>
                    <div><strong>Serviço:</strong> {ag.servico}</div>
                    {/* Backend envia 'data' como YYYY-MM-DD. Adicionamos T00:00:00 para evitar problemas de fuso ao converter para Date */}
                    <div><strong>Data:</strong> {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                    {ag.nomeFuncionario && <div><strong>Funcionário:</strong> {ag.nomeFuncionario}</div>}
                    {ag.valorServico && <div><strong>Valor:</strong> R$ {ag.valorServico.toFixed(2)}</div>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} VetFofinhosRonaldo. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};
