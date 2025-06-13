import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { pagamentoService, FormaPagamento, PagamentoError } from '../../services/pagamentoService';
import type { Pagamento } from '../../services/pagamentoService';
import { cartaoService, TipoCartao, CartaoError, type Cartao } from '../../services/cartaoService';
import axios from 'axios';
import { API_URLS } from '../../services/api';
import type { CarrinhoDetalhado, ItemCarrinhoDetalhado } from '../../types';
import './Pagamento.css';

console.log('PagamentoComponent: Arquivo carregado.'); // Este log deve aparecer assim que o componente é processado

// Enums correspondentes ao backend
enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  CANCELADO = 'CANCELADO'
}

interface PaymentFormData {
  valor: string;
  formaPagamento: FormaPagamento;
  idUsuario?: number; // Adicionado para corrigir erro TS2339
  idPedido?: number;  // Adicionado para corrigir erro TS2339
  numeroCartao?: string;
  nomeTitular?: string;
  dataValidade?: string;
  cvv?: string;
  tipoCartao?: string;
  cpfCliente: string;
}

interface Agendamento {
  id: number;
  data: string; // Formato YYYY-MM-DD
  servico: string;
  valorServico?: number;
  status?: string;
  // outros campos opcionais
}

interface ResumoPagamento {
  produtos: ItemCarrinhoDetalhado[];
  agendamentos: Agendamento[];
  totalProdutos: number;
  totalAgendamentos: number;
  valorTotal: number;
}

const PagamentoComponent: React.FC = () => {
  console.log("Renderizando PagamentoComponent");
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PaymentFormData>({
    valor: '',
    formaPagamento: FormaPagamento.CARTAO,
    tipoCartao: 'CREDITO', // Valor inicial para tipoCartao
    cpfCliente: '',
    // idUsuario e idPedido podem ser inicializados se necessário, ou deixados como undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [cartoesSalvos, setCartoesSalvos] = useState<Cartao[]>([]);
  const [loadingCartoes, setLoadingCartoes] = useState(false);
  const [erroCartoes, setErroCartoes] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [resumoPagamento, setResumoPagamento] = useState<ResumoPagamento | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCardSelect = (cartao: Cartao) => {
    setSelectedCardId(cartao.id ?? null); // Se cartao.id for undefined, usa null
    setFormData(prev => ({
      ...prev,
      numeroCartao: formatCardNumber(cartao.numeroCartao),
      nomeTitular: cartao.nomeTitular,
      dataValidade: formatDate(cartao.dataValidade),
      tipoCartao: cartao.tipoCartao,
      formaPagamento: FormaPagamento.CARTAO,
      // cpfCliente: cartao.cpfTitular // Considere preencher o CPF se o cartão salvo tiver essa info
    }));
  };

  useEffect(() => {
    async function fetchCartoesSalvos() {
      setLoadingCartoes(true);
      setErroCartoes(null);
      try {
        // Obter ID do usuário do localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setErroCartoes('Usuário não encontrado. Por favor, faça login novamente.');
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.id) {
          setErroCartoes('ID do usuário não encontrado. Por favor, faça login novamente.');
          return;
        }

        console.log('Buscando cartões para o usuário:', user.id);
        const lista = await cartaoService.buscarCartoesPorUsuario(user.id);
        console.log('Cartões encontrados:', lista);
        
        if (Array.isArray(lista)) {
          setCartoesSalvos(lista);
        } else {
          console.error('Resposta inválida do servidor:', lista);
          setErroCartoes('Erro ao carregar cartões. Formato de resposta inválido.');
          setCartoesSalvos([]);
        }
      } catch (e) {
        console.error("Erro ao buscar cartões:", e);
        if (e instanceof CartaoError) {
          setErroCartoes(e.message);
        } else {
          setErroCartoes('Erro ao carregar cartões salvos. Tente novamente.');
        }
        setCartoesSalvos([]);
      } finally {
        setLoadingCartoes(false);
      }
    }
    fetchCartoesSalvos();
  }, []);

  useEffect(() => {
    const fetchDadosPagamento = async () => {
      setLoading(true);
      setError(null);

      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Usuário não encontrado');
        }

        const user = JSON.parse(userStr);
        const idCliente = user.id;
        const token = localStorage.getItem('token');

        // Buscar carrinho do cliente
        const carrinhoResponse = await axios.get<{ success: boolean; data: CarrinhoDetalhado }>(
          `${API_URLS.vendas}/carrinho/${idCliente}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Buscar agendamentos do cliente
        const agendamentosResponse = await axios.get<Agendamento[]>(
          `${API_URLS.servicos}/agendamentos/cliente/${idCliente}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const carrinho = carrinhoResponse.data.data; // Acessar a propriedade data da resposta
        const agendamentos = agendamentosResponse.data;

        // Adicionar log para depuração
        console.log('Agendamentos recebidos:', agendamentos);

        // Calcular totais
        const totalProdutos = Number(carrinho.total) || 0;
        const totalAgendamentos = agendamentos.reduce((sum, agendamento) => sum + Number(agendamento.valorServico || 0), 0);
        const valorTotal = totalProdutos + totalAgendamentos;

        setResumoPagamento({
          produtos: carrinho.itens || [],
          agendamentos: agendamentos,
          totalProdutos,
          totalAgendamentos,
          valorTotal
        });

        // Atualizar o valor no formData
        setFormData(prev => ({
          ...prev,
          valor: valorTotal.toString()
        }));

      } catch (err) {
        console.error('Erro ao buscar dados para pagamento:', err);
        setError('Erro ao carregar dados para pagamento. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDadosPagamento();
  }, []);

  // Formatação de valores
  const formatCurrency = (value: string) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return (Number(number) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatCardNumber = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
  };

  const formatCPF = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Validações
  const validateForm = () => {
    console.log('validateForm: Iniciando validação.');
    if (!formData.valor || Number(formData.valor.replace(/\D/g, '')) <= 0) {
      setError('Valor inválido. Por favor, insira um valor para o pagamento.');
      console.log('validateForm: Erro - Valor inválido.');
      return false;
    }

    if (formData.formaPagamento === FormaPagamento.CARTAO) {
      if (!formData.numeroCartao || formData.numeroCartao.replace(/\D/g, '').length !== 16) {
        setError('Número do cartão inválido. Deve conter 16 dígitos.');
        console.log('validateForm: Erro - Número do cartão inválido.');
        return false;
      }
      if (!formData.nomeTitular?.trim()) {
        setError('Nome do titular é obrigatório.');
        console.log('validateForm: Erro - Nome do titular obrigatório.');
        return false;
      }
      if (!formData.dataValidade || formData.dataValidade.replace(/\D/g, '').length !== 4) {
        setError('Data de validade inválida. Use o formato MM/AA.');
        console.log('validateForm: Erro - Data de validade inválida.');
        return false;
      }
      if (!formData.cvv || formData.cvv.replace(/\D/g, '').length < 3 || formData.cvv.replace(/\D/g, '').length > 4) {
        setError('CVV inválido. Deve conter 3 ou 4 dígitos.');
        console.log('validateForm: Erro - CVV inválido.');
        return false;
      }
    }

    if (!formData.cpfCliente || formData.cpfCliente.replace(/\D/g, '').length !== 11) {
      setError('CPF do cliente inválido. Deve conter 11 dígitos.');
      console.log('validateForm: Erro - CPF inválido.');
      return false;
    }
    // Adicionar validação para idUsuario e idPedido se forem obrigatórios
    // if (formData.idUsuario === undefined || formData.idUsuario <=0) {
    //   setError('ID do usuário inválido.');
    //   return false;
    // }
    // if (formData.idPedido === undefined || formData.idPedido <=0) {
    //   setError('ID do pedido inválido.');
    //   return false;
    // }

    setError(null); // Limpa erros anteriores se a validação passar
    console.log('validateForm: Validação bem-sucedida.');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'valor') {
      processedValue = value.replace(/\D/g, ''); // Apenas números para o valor
    } else if (name === 'numeroCartao') {
      processedValue = formatCardNumber(value);
    } else if (name === 'dataValidade') {
      processedValue = formatDate(value);
    } else if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4); // CVV pode ter até 4 dígitos (Amex)
    } else if (name === 'cpfCliente') {
      processedValue = formatCPF(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handlePaymentMethodChange = (method: FormaPagamento) => {
    setFormData(prev => ({
      ...prev,
      formaPagamento: method,
      // Limpar dados do cartão se mudar para PIX e vice-versa, se desejado
      numeroCartao: method === FormaPagamento.PIX ? '' : prev.numeroCartao,
      nomeTitular: method === FormaPagamento.PIX ? '' : prev.nomeTitular,
      dataValidade: method === FormaPagamento.PIX ? '' : prev.dataValidade,
      cvv: method === FormaPagamento.PIX ? '' : prev.cvv,
    }));
    setError(null); // Limpar erros ao mudar forma de pagamento
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit: Função iniciada.'); // Log no início da função
    setError(null);

    // Obter ID do usuário do localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Usuário não encontrado. Por favor, faça login novamente.');
      console.log('handleSubmit: Usuário não encontrado, saindo.');
      return;
    }

    const user = JSON.parse(userStr);
    if (!user.id) {
      setError('ID do usuário não encontrado. Por favor, faça login novamente.');
      console.log('handleSubmit: ID do usuário não encontrado, saindo.');
      return;
    }

    // Simular idPedido - Em um app real, viria do estado global/contexto/props
    const idPedidoSimulado = Math.floor(Math.random() * 1000) + 1; // Substituir pela lógica real

    const currentFormData = {
      ...formData,
      idUsuario: user.id,
      idPedido: idPedidoSimulado,
    };

    console.log('handleSubmit: Chamando validateForm()...');
    if (!validateForm()) {
      console.log('handleSubmit: validateForm() retornou false, saindo.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Iniciando handleSubmit (dentro do try)...');
      // Criar cartão apenas se for um novo cartão e a forma de pagamento for CARTAO
      if (currentFormData.formaPagamento === FormaPagamento.CARTAO && !selectedCardId) {
        console.log('Tentando criar novo cartão...');
        const cartaoData = {
          numeroCartao: currentFormData.numeroCartao!.replace(/\D/g, ''),
          nomeTitular: currentFormData.nomeTitular!,
          dataValidade: currentFormData.dataValidade!.replace(/\D/g, ''), // Remover todos os caracteres não numéricos
          cvv: currentFormData.cvv!,
          tipoCartao: currentFormData.tipoCartao === 'DEBITO' ? TipoCartao.DEBITO : TipoCartao.CREDITO,
          cpfTitular: currentFormData.cpfCliente.replace(/\D/g, ''),
          idUsuario: user.id
        };

        console.log('Dados do cartão a serem enviados:', cartaoData);
        await cartaoService.criarCartao(cartaoData);
        console.log('Cartão criado com sucesso no frontend.');
        
        // Recarregar lista de cartões após salvar
        console.log('Recarregando cartões salvos...');
        const lista = await cartaoService.buscarCartoesPorUsuario(user.id);
        setCartoesSalvos(lista);
        console.log('Cartões salvos recarregados.');
      }

      const pagamentoData: Pagamento = {
        valor: Number(currentFormData.valor.replace(/\D/g, '')),
        formaPagamento: currentFormData.formaPagamento,
        status: StatusPagamento.PENDENTE,
        idPedido: currentFormData.idPedido!,
        nomeCliente: currentFormData.formaPagamento === FormaPagamento.CARTAO ? currentFormData.nomeTitular! : 'Cliente PIX/Boleto',
        cpfCliente: currentFormData.cpfCliente.replace(/\D/g, ''),
        idUsuario: user.id,
      };

      console.log('Criando pagamento com os dados:', pagamentoData);
      const response = await pagamentoService.criarPagamento(pagamentoData);
      console.log('Pagamento criado com sucesso:', response);
      setSuccess(true);
      
      if (currentFormData.formaPagamento === FormaPagamento.PIX && response.chavePix) {
        setPixKey(response.chavePix);
      } else if (currentFormData.formaPagamento === FormaPagamento.CARTAO) {
        console.log("Pagamento com cartão enviado:", response);
      }
    } catch (err) {
      console.error("Erro no handleSubmit:", err);
      if (err instanceof PagamentoError || err instanceof CartaoError) {
        setError(err.message);
      } else if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Erro ao processar pagamento.');
      } else {
        setError('Ocorreu um erro inesperado ao processar o pagamento.');
      }
    } finally {
      console.log('Finalizando handleSubmit.');
      setIsLoading(false);
    }
  };

  // Se o valor do pagamento vier de outro lugar (ex: carrinho), você pode recebê-lo via props ou estado global
  // e definir no useEffect. Exemplo:
  // useEffect(() => {
  //   const valorDoCarrinho = 10050; // R$ 100,50 em centavos
  //   setFormData(prev => ({ ...prev, valor: valorDoCarrinho.toString() }));
  // }, []);

  return (
    <div className="pagamento-container">
      <h2>Pagamento</h2>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="error-message">{error}</p>}

      {resumoPagamento && (
        <div className="resumo-pagamento">
          <h3>Resumo do Pagamento</h3>
          
          {/* Produtos do Carrinho */}
          <div className="secao-produtos">
            <h4>Produtos no Carrinho</h4>
            {resumoPagamento.produtos.map(item => (
              <div key={item.idProduto} className="item-produto">
                <span>{item.nome}</span>
                <span>Quantidade: {item.quantidade}</span>
                <span>R$ {Number((item.preco || 0) * (item.quantidade || 0)).toFixed(2)}</span>
              </div>
            ))}
            <div className="subtotal">
              <strong>Subtotal Produtos:</strong>
              <span>R$ {Number(resumoPagamento.totalProdutos || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Agendamentos */}
          <div className="secao-agendamentos">
            <h4>Agendamentos</h4>
            {resumoPagamento.agendamentos.map(agendamento => (
              <div key={agendamento.id} className="item-agendamento">
                <span>{agendamento.servico}</span>
                <span>{agendamento.data ? new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                <span>R$ {Number(agendamento.valorServico || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="subtotal">
              <strong>Subtotal Agendamentos:</strong>
              <span>R$ {Number(resumoPagamento.totalAgendamentos || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Valor Total */}
          <div className="valor-total">
            <h3>Valor Total a Pagar</h3>
            <span>R$ {Number(resumoPagamento.valorTotal || 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="payment-container">
        <h2>Pagamento</h2>
        <div className="cartoes-salvos-section">
          <h3>Cartões Salvos</h3>
          {loadingCartoes && <div className="loading">Carregando cartões...</div>}
          {erroCartoes && <div className="error-message">{erroCartoes}</div>}
          {!loadingCartoes && !erroCartoes && cartoesSalvos.length === 0 && (
            <div className="empty">Nenhum cartão salvo.</div>
          )}
          {!loadingCartoes && !erroCartoes && cartoesSalvos.length > 0 && (
            <div className="cartoes-grid">
              {cartoesSalvos.map(cartao => (
                <div 
                  className={`cartao-salvo-item ${selectedCardId === cartao.id ? 'selected' : ''}`}
                  key={cartao.id}
                  onClick={() => handleCardSelect(cartao)}
                  role="button" // Adicionar role para acessibilidade
                  tabIndex={0}  // Adicionar tabIndex para acessibilidade
                  onKeyPress={(e) => e.key === 'Enter' && handleCardSelect(cartao)} // Adicionar evento de teclado
                  style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', margin: '5px', borderRadius: '5px' }}
                >
                  <div className="cartao-numero">•••• •••• •••• {cartao.numeroCartao.slice(-4)}</div>
                  <div className="cartao-nome">{cartao.nomeTitular}</div>
                  <div className="cartao-tipo">{cartao.tipoCartao}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message" role="alert"> {/* Adicionar role para acessibilidade */}
            {error}
          </div>
        )}

        {success ? (
          <div className="success-message">
            <h2>Pagamento Processado com Sucesso!</h2>
            <p>Seu pagamento foi recebido e está sendo processado.</p>
            {pixKey && (
              <div className="qr-code-container">
                <QRCodeSVG value={pixKey} size={200} />
                <p>Escaneie o QR Code para pagar via PIX</p>
                <p><strong>Chave PIX:</strong> {pixKey}</p> {/* Mostrar a chave PIX também */}
              </div>
            )}
            <button
              type="button" // Adicionar type="button"
              className="payment-button"
              onClick={() => navigate('/agendamentos')} // Ajustar rota se necessário
            >
              Voltar para Agendamentos
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="payment-form">
            

            <div className="payment-methods">
              <h3>Forma de Pagamento</h3>
              <div className="payment-method-buttons">
                <button
                  type="button"
                  className={`payment-method-button ${formData.formaPagamento === FormaPagamento.CARTAO ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange(FormaPagamento.CARTAO)}
                >
                  Cartão ({formData.tipoCartao === 'DEBITO' ? 'Débito' : 'Crédito'})
                </button>
                <button
                  type="button"
                  className={`payment-method-button ${formData.formaPagamento === FormaPagamento.PIX ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange(FormaPagamento.PIX)}
                >
                  PIX
                </button>
              </div>
            </div>

            {formData.formaPagamento === FormaPagamento.CARTAO && ( // Remover a condição extra de tipoCartao aqui
              <>
                <div className="form-group">
                  <label htmlFor="numeroCartao">Número do Cartão</label>
                  <input
                    type="text"
                    id="numeroCartao"
                    name="numeroCartao"
                    value={formData.numeroCartao ?? ''} 
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19} // 16 dígitos + 3 espaços
                    required={formData.formaPagamento === FormaPagamento.CARTAO}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dataValidade">Data de Validade</label>
                    <input
                      type="text"
                      id="dataValidade"
                      name="dataValidade"
                      value={formData.dataValidade ?? ''}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength={5} // MM/AA
                      required={formData.formaPagamento === FormaPagamento.CARTAO}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text" // Usar text para permitir formatação, mas validar como número
                      id="cvv"
                      name="cvv"
                      value={formData.cvv ?? ''}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4} // CVV Amex tem 4 dígitos
                      required={formData.formaPagamento === FormaPagamento.CARTAO}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nomeTitular">Nome do Titular</label>
                  <input
                    type="text"
                    id="nomeTitular"
                    name="nomeTitular"
                    value={formData.nomeTitular ?? ''}
                    onChange={handleInputChange}
                    placeholder="Nome como está no cartão"
                    required={formData.formaPagamento === FormaPagamento.CARTAO}
                  />
                </div>

                
              </>
            )}
            
            {formData.formaPagamento === FormaPagamento.PIX && (
              <div className="pix-payment">
                <p>O QR Code do PIX será gerado após a confirmação do pagamento.</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cpfCliente">CPF do Cliente</label>
              <input
                type="text"
                id="cpfCliente"
                name="cpfCliente"
                value={formData.cpfCliente}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                maxLength={14} // 11 dígitos + 3 caracteres de formatação
                required
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="payment-button secondary"
                onClick={() => navigate('/agendamentos')} // Ajustar rota se necessário
              >
                Cancelar
              </button>
              <button
                type="button"
                className="payment-button secondary"
                onClick={() => navigate('/cartao')} // Ajustar rota para cadastro de cartão
              >
                Adicionar Novo Cartão
              </button>
              <button
                type="submit"
                className="payment-button"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Pagar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PagamentoComponent;