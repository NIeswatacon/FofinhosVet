import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import { API_URLS } from '../../services/api';
import styles from './AgendamentosPage.module.css'; // Verifique o nome real do seu arquivo .css
import NavBar from '../../components/NavBar/NavBar';

const API_AGENDAMENTOS_BASE_URL = `${API_URLS.servicos}/agendamentos`;
const API_CONTAS_BASE_URL = `${API_URLS.conta}/api/contas`;

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
  const [clienteIdFromAuth, setClienteIdFromAuth] = useState<number | null>(null); // Estado para o ID do cliente logado
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
  // Função para obter o ID do usuário do localStorage
  const getUserId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch (e) {
      console.error('Erro ao obter ID do usuário:', e);
      return null;
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId !== null) {
      setClienteIdFromAuth(userId);
      // Limpar qualquer erro anterior se o usuário for encontrado
      setError(null);
    } else {
      setError("Nenhum cliente logado. Por favor, faça o login para acessar esta página.");
      // Garante que estados dependentes sejam limpos se não houver usuário
      setClienteIdFromAuth(null);
      setLoggedInCliente(null);
      setAgendamentos([]);
      setFormData({
        nomeCliente: '',
        petNome: '',
        servico: ServicoEnumFrontend.BANHO,
        data: '',
        dataHoraInput: '',
        nomeFuncionario: '',
      });
      setPets([]);
    }
  }, []); // Executa apenas uma vez na montagem

  const fetchAgendamentos = async () => {
    // A verificação do loggedInCliente já garante que teremos o ID.
    if (!loggedInCliente) return;

    setIsLoading(true);
    setError(null);
    try {
      // Usando o novo endpoint otimizado do backend
      const response = await axios.get<Agendamento[]>(`${API_AGENDAMENTOS_BASE_URL}/cliente/${loggedInCliente.id}`);
      setAgendamentos(response.data);
    } catch (err) {
      setError('Falha ao buscar agendamentos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoggedInClienteData = async (id: number) => {
    if (!id) {
      setError("ID do cliente logado não definido.");
      setLoggedInCliente(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get<Cliente>(`${API_CONTAS_BASE_URL}/${id}`);
      setLoggedInCliente(response.data);
      // Pré-preenche nomeCliente no formData
      setFormData(prev => ({ ...prev, nomeCliente: response.data.nome }));
      setError(null); // Limpa erros anteriores se a busca for bem-sucedida
    } catch (err) {
      setError(`Falha ao buscar dados do cliente ID: ${id}. Verifique se o cliente existe e o microserviço de Contas está rodando.`);
      console.error(err);
      setLoggedInCliente(null);
    } finally {
      setIsLoading(false); // Garante que o loading seja desativado
    }
  };

  const fetchPetsDoCliente = async (clienteId: number) => {
    if (!clienteId) {
      setPets([]);
      setSelectedPetIdForDropdown('');
      setFormData(prev => ({ ...prev, petNome: '' }));
      return;
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
    if (clienteIdFromAuth) {
      fetchLoggedInClienteData(clienteIdFromAuth);
    } // Não é necessário um 'else' aqui.
    // Se clienteIdFromAuth for null, o primeiro useEffect já definiu o erro
    // e limpou os estados relevantes (loggedInCliente, pets, formData, agendamentos).
  }, [clienteIdFromAuth]); // Dependência no ID do cliente obtido da "autenticação"

  useEffect(() => {
    if (loggedInCliente && loggedInCliente.id) {
      fetchPetsDoCliente(loggedInCliente.id);
      fetchAgendamentos(); // fetchAgendamentos usará loggedInCliente.nome para filtrar
    } else {
      // Se loggedInCliente for null (seja por falha no fetch ou por não haver clienteIdFromAuth),
      // limpa os dados dependentes.
      setPets([]);
      setSelectedPetIdForDropdown('');
      setFormData(prev => ({
        ...prev,
        nomeCliente: '', // Limpar nome do cliente no formulário
        petNome: ''      // Limpar nome do pet no formulário
      }));
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

    // Validação
    if (!loggedInCliente || !selectedPetIdForDropdown || !formData.servico || !formData.data) {
      setError('Cliente, Pet, Serviço e Data são campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    // O backend espera um payload com idPet, idFuncionario (opcional), data e servico.
    // O seu AgendamentoRequestDTO no backend tem esses campos.
    const payload = {
      idPet: parseInt(selectedPetIdForDropdown, 10), // O ID do Pet selecionado no dropdown
      servico: formData.servico,
      data: formData.data,
      // Mesmo que o nome seja opcional, podemos enviar o ID se o tivermos no futuro.
      // Por agora, enviaremos o nome conforme o backend parece usar.
      nomeFuncionario: formData.nomeFuncionario,
      // O idFuncionario não está sendo coletado, então não o enviamos. O backend não exige.
    };

    try {
      // A chamada para a API de agendamentos está correta, usando o `servicos-service`
      // Vamos garantir que a URL base esteja correta (sem o /api/agendamentos duplicado)
      // A constante API_AGENDAMENTOS_BASE_URL já deve ser 'http://<seu_servico_de_agendamentos>/api/agendamentos'
      await axios.post(API_AGENDAMENTOS_BASE_URL, payload, {
        headers: {
          // O backend usa este header para validar o cliente. Está correto.
          'X-User-ID': loggedInCliente.id.toString(),
        },
      });

      setSuccessMessage('Agendamento criado com sucesso!');
      
      // Limpa o formulário após o sucesso, mas mantém o nome do cliente
      setFormData({
        nomeCliente: loggedInCliente?.nome || '',
        petNome: '',
        servico: ServicoEnumFrontend.BANHO,
        data: '',
        dataHoraInput: '',
        nomeFuncionario: '',
      });
      setSelectedPetIdForDropdown('');

      // Re-busca os agendamentos para atualizar a lista na tela
      if (loggedInCliente?.id) {
        fetchAgendamentos();
      }

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Se o backend retornar uma mensagem de erro específica, mostre-a.
        setError(err.response.data.message || 'Falha ao criar agendamento. Verifique os dados e tente novamente.');
      } else {
        setError('Falha ao criar agendamento. Verifique sua conexão e tente novamente.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  // 1. Estado inicial de carregamento/verificação ou usuário não logado (erro do getUserId)
  if (!clienteIdFromAuth) {
    const message = error || "Verificando autenticação...";
    return (
      <div>
        <NavBar />
        <div className={styles.container}>
          <p className={error ? styles.errorMessage : styles.loadingMessage}>{message}</p>
        </div>
        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} VetFofinhosRonaldo. Todos os direitos reservados.</p>
        </footer>
      </div>
    );
  }
  // A partir daqui, clienteIdFromAuth EXISTE.

  // 2. Carregando dados do cliente ou erro ao carregar dados do cliente
  if (!loggedInCliente) {
    let messageContent;
    if (isLoading) {
      messageContent = <p>Carregando dados do cliente...</p>;
    } else if (error) {
      messageContent = <p className={styles.errorMessage}>{error}</p>;
    } else {
      // Fallback: clienteIdFromAuth existe, não está carregando, não há erro, mas loggedInCliente é null.
      messageContent = <p className={styles.errorMessage}>Não foi possível carregar os dados do cliente. Por favor, tente recarregar a página.</p>;
    }
    return (
      <div>
        <NavBar />
        <div className={styles.container}>
          {messageContent}
        </div>
        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} VetFofinhosRonaldo. Todos os direitos reservados.</p>
        </footer>
      </div>
    );
  }

  // 3. Dados do cliente carregados (loggedInCliente existe) -> Renderiza a página principal

  return (
    <div>
      <NavBar />
      <div className={styles.container}>
        <>
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
                      <div><strong>Data:</strong> {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                      {ag.nomeFuncionario && <div><strong>Funcionário:</strong> {ag.nomeFuncionario}</div>}
                      {ag.valorServico && <div><strong>Valor:</strong> R$ {ag.valorServico.toFixed(2)}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </>
        {/* O conteúdo principal é renderizado aqui porque loggedInCliente já foi verificado */}
        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} VetFofinhosRonaldo. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
