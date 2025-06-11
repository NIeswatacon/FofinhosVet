package br.unifor.pagamento.Service;

import br.unifor.pagamento.model.Cartao;
import br.unifor.pagamento.repository.CartaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class CartaoService {
    private static final Logger logger = LoggerFactory.getLogger(CartaoService.class);
    private final CartaoRepository cartaoRepository;

    @Autowired
    public CartaoService(CartaoRepository cartaoRepository) {
        this.cartaoRepository = cartaoRepository;
    }

    public List<Cartao> listarTodos() {
        logger.info("Listando todos os cartões");
        List<Cartao> cartoes = cartaoRepository.findAll();
        logger.info("Encontrados {} cartões", cartoes.size());
        return cartoes;
    }

    public Cartao adicionarCartao(Cartao cartao) {
        logger.info("Adicionando novo cartão para usuário: {}", cartao.getIdUsuario());
        Cartao savedCartao = cartaoRepository.save(cartao);
        logger.info("Cartão adicionado com sucesso. ID: {}", savedCartao.getId());
        return savedCartao;
    }

    public List<Cartao> buscarCartoesPorUsuario(Long idUsuario) {
        logger.info("Buscando cartões para usuário ID: {}", idUsuario);
        List<Cartao> cartoes = cartaoRepository.findByIdUsuario(idUsuario);
        logger.info("Encontrados {} cartões para o usuário {}", cartoes.size(), idUsuario);
        return cartoes;
    }

    public void deletarCartao(Long id) {
        logger.info("Deletando cartão ID: {}", id);
        cartaoRepository.deleteById(id);
        logger.info("Cartão deletado com sucesso");
    }

    public Optional<Cartao> buscarCartaoPorId(Long id) {
        logger.info("Buscando cartão por ID: {}", id);
        Optional<Cartao> cartao = cartaoRepository.findById(id);
        logger.info("Cartão encontrado: {}", cartao.isPresent());
        return cartao;
    }
} 