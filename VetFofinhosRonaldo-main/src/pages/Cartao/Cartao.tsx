import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartaoService, TipoCartao } from '../../services/cartaoService';
import type { Cartao } from '../../services/cartaoService';
import './Cartao.css';

const cores = {
  credito: 'linear-gradient(135deg, #007bff 60%, #6c757d 100%)',
  debito: 'linear-gradient(135deg, #28a745 60%, #007bff 100%)',
};

function maskCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
}

function maskDate(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
}

function maskCVV(value: string) {
  return value.replace(/\D/g, '').slice(0, 3);
}

function maskCPF(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function getCardFlag(number: string) {
  const num = number.replace(/\D/g, '');
  if (num.startsWith('4')) return 'visa';
  if (num.startsWith('5')) return 'mastercard';
  if (num.startsWith('3')) return 'amex';
  return 'default';
}

const CartaoComponent: React.FC = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    numeroCartao: '',
    nomeTitular: '',
    dataValidade: '',
    cvv: '',
    tipoCartao: TipoCartao.CREDITO,
    cpfTitular: '',
    idUsuario: 0, // Será preenchido com o ID do usuário logado
  });
  const [formTouched, setFormTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [removingId, setRemovingId] = useState<number|null>(null);
  const [tab, setTab] = useState<TipoCartao>(TipoCartao.CREDITO);
  const navigate = useNavigate();

  useEffect(() => {
    // Obter ID do usuário do localStorage
    const userStr = localStorage.getItem('user');
    console.log('Dados do usuário do localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Usuário parseado:', user);
        
        if (user && user.id) {
          console.log('ID do usuário encontrado:', user.id);
          setForm(prev => ({ ...prev, idUsuario: user.id }));
        } else {
          console.error('ID do usuário não encontrado no objeto:', user);
          setFormError('ID do usuário não encontrado. Por favor, faça login novamente.');
          navigate('/login');
        }
      } catch (e) {
        console.error('Erro ao parsear dados do usuário:', e);
        setFormError('Erro ao carregar dados do usuário. Por favor, faça login novamente.');
        navigate('/login');
      }
    } else {
      console.error('Nenhum dado de usuário encontrado no localStorage');
      setFormError('Usuário não encontrado. Por favor, faça login novamente.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (form.idUsuario) {
      console.log('ID do usuário atualizado, buscando cartões para:', form.idUsuario);
      fetchCartoes();
    }
  }, [form.idUsuario]);

  const fetchCartoes = async () => {
    if (!form.idUsuario) {
      console.error('ID do usuário não encontrado no form:', form);
      setFormError('ID do usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    console.log('Iniciando busca de cartões para usuário:', form.idUsuario);
    setLoading(true);
    try {
      console.log('Chamando cartaoService.buscarCartoesPorUsuario...');
      const lista = await cartaoService.buscarCartoesPorUsuario(form.idUsuario);
      console.log('Resposta do backend:', lista);
      setCartoes(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.error('Erro detalhado ao carregar cartões:', e);
      setFormError('Erro ao carregar cartões. Tente novamente.');
      setCartoes([]); // Garantir que cartoes seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!form.numeroCartao || form.numeroCartao.replace(/\D/g, '').length !== 16) return 'Número do cartão inválido';
    if (!form.nomeTitular) return 'Nome do titular é obrigatório';
    if (!form.dataValidade || !/^\d{2}\/\d{2}$/.test(form.dataValidade)) return 'Data de validade inválida';
    // Validade não expirada
    const [mm, yy] = form.dataValidade.split('/');
    const now = new Date();
    const exp = new Date(Number('20'+yy), Number(mm)-1);
    if (exp < now) return 'Cartão expirado';
    if (!form.cvv || form.cvv.length !== 3) return 'CVV inválido';
    if (!form.cpfTitular || form.cpfTitular.replace(/\D/g, '').length !== 11) return 'CPF inválido';
    return '';
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'numeroCartao') v = maskCardNumber(value);
    if (name === 'dataValidade') v = maskDate(value);
    if (name === 'cvv') v = maskCVV(value);
    if (name === 'cpfTitular') v = maskCPF(value);
    setForm({ ...form, [name]: v });
    setFormTouched(true);
    setFormError('');
  };

  const handleTab = (tipo: TipoCartao) => setTab(tipo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    if (!form.idUsuario) {
      setFormError('ID do usuário não encontrado. Por favor, faça login novamente.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        numeroCartao: form.numeroCartao.replace(/\D/g, ''),
        dataValidade: form.dataValidade.replace(/\D/g, ''),
        cpfTitular: form.cpfTitular.replace(/\D/g, ''),
      };
      console.log('Enviando para o backend:', payload);
      await cartaoService.criarCartao(payload);
      setSuccessMsg('Cartão cadastrado com sucesso!');
      setForm({ numeroCartao: '', nomeTitular: '', dataValidade: '', cvv: '', tipoCartao: tab, cpfTitular: '', idUsuario: form.idUsuario });
      fetchCartoes();
      navigate('/pagamento');
    } catch (e) {
      console.error('Erro ao cadastrar cartão:', e);
      setFormError('Erro ao cadastrar cartão. Tente novamente.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const handleRemove = async (id: number) => {
    if (!window.confirm('Deseja realmente remover este cartão?')) return;
    setRemovingId(id);
    try {
      await cartaoService.deletarCartao(id);
      setCartoes(cartoes.filter(c => c.id !== id));
    } catch {
      setFormError('Erro ao remover cartão. Tente novamente.');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredCartoes = Array.isArray(cartoes) ? cartoes.filter(c => c.tipoCartao === tab) : [];

  // Preview do cartão
  const preview = (
    <div className={`card-preview ${form.tipoCartao.toLowerCase()}`}
      style={{ background: form.tipoCartao === TipoCartao.CREDITO ? cores.credito : cores.debito }}>
      <div className="card-flag">
        <span className={`flag flag-${getCardFlag(form.numeroCartao)}`}></span>
        <span className="card-type">{form.tipoCartao}</span>
      </div>
      <div className="card-number">{form.numeroCartao.padEnd(19, '•')}</div>
      <div className="card-details">
        <span>{form.nomeTitular || 'NOME DO TITULAR'}</span>
        <span>{form.dataValidade || 'MM/AA'}</span>
      </div>
    </div>
  );

  return (
    <div className="cartao-container">
      <header>
        <h2>Meus Cartões</h2>
        <div className="tabs">
          <button className={tab === TipoCartao.CREDITO ? 'active' : ''} onClick={() => handleTab(TipoCartao.CREDITO)}>Crédito</button>
          <button className={tab === TipoCartao.DEBITO ? 'active' : ''} onClick={() => handleTab(TipoCartao.DEBITO)}>Débito</button>
        </div>
      </header>

      <section className="cartoes-lista">
        {loading ? <div className="loading">Carregando...</div> :
          filteredCartoes.length === 0 ? <div className="empty">Nenhum cartão cadastrado.</div> :
            <div className="cards-grid">
              {filteredCartoes.map(cartao => (
                <div className={`card-item ${removingId === cartao.id ? 'removing' : ''}`} key={cartao.id} style={{ background: cartao.tipoCartao === TipoCartao.CREDITO ? cores.credito : cores.debito }}>
                  <div className="card-flag">
                    <span className={`flag flag-${getCardFlag(cartao.numeroCartao)}`}></span>
                    <span className="card-type">{cartao.tipoCartao}</span>
                  </div>
                  <div className="card-number">•••• •••• •••• {cartao.numeroCartao.slice(-4)}</div>
                  <div className="card-details">
                    <span>{cartao.nomeTitular}</span>
                    <span>{cartao.dataValidade.slice(0,2) + '/' + cartao.dataValidade.slice(2)}</span>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(cartao.id!)} disabled={removingId === cartao.id} title="Remover cartão">🗑️</button>
                </div>
              ))}
            </div>
        }
      </section>

      <section className="cartao-form-section">
        <h3>Adicionar Novo Cartão</h3>
        {preview}
        <form className="cartao-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-row">
            <input type="text" name="numeroCartao" placeholder="Número do Cartão" value={form.numeroCartao} onChange={handleInput} maxLength={19} className={formTouched && (!form.numeroCartao || form.numeroCartao.replace(/\D/g, '').length !== 16) ? 'invalid' : ''} />
            <input type="text" name="nomeTitular" placeholder="Nome do Titular" value={form.nomeTitular} onChange={handleInput} className={formTouched && !form.nomeTitular ? 'invalid' : ''} />
          </div>
          <div className="form-row">
            <input type="text" name="dataValidade" placeholder="MM/AA" value={form.dataValidade} onChange={handleInput} maxLength={5} className={formTouched && (!form.dataValidade || !/^\d{2}\/\d{2}$/.test(form.dataValidade)) ? 'invalid' : ''} />
            <input type="text" name="cvv" placeholder="CVV" value={form.cvv} onChange={handleInput} maxLength={3} className={formTouched && (!form.cvv || form.cvv.length !== 3) ? 'invalid' : ''} />
          </div>
          <div className="form-row">
            <select name="tipoCartao" value={form.tipoCartao} onChange={handleInput}>
              <option value={TipoCartao.CREDITO}>Crédito</option>
              <option value={TipoCartao.DEBITO}>Débito</option>
            </select>
            <input type="text" name="cpfTitular" placeholder="CPF do Titular" value={form.cpfTitular} onChange={handleInput} maxLength={14} className={formTouched && (!form.cpfTitular || form.cpfTitular.replace(/\D/g, '').length !== 11) ? 'invalid' : ''} />
          </div>
         
          {formError && <div className="form-error">{formError}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}
          <div className="form-row form-actions">
            <button type="submit" className="add-btn" onClick={() => navigate('/pagamento')} disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar Cartão'}
            </button>
            <button type="button" className="voltar-btn" onClick={() => navigate(-1)}>
              Voltar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CartaoComponent; 