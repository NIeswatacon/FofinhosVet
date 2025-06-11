package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.model.Cartao;
import br.com.petshop.conta_service.repository.CartaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartaoService {

    private final CartaoRepository cartaoRepository;

    @Autowired
    public CartaoService(CartaoRepository cartaoRepository) {
        this.cartaoRepository = cartaoRepository;
    }

    @Transactional
    public Cartao criarCartao(Cartao cartao) {
        // Adicione validações ou lógica de negócio aqui, se necessário
        return cartaoRepository.save(cartao);
    }

    @Transactional(readOnly = true)
    public List<Cartao> listarCartoesPorUsuario(Long idUsuario) {
        return cartaoRepository.findByIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public Optional<Cartao> buscarCartaoPorId(Long id) {
        return cartaoRepository.findById(id);
    }

    @Transactional
    public Cartao atualizarCartao(Long id, Cartao cartaoAtualizado) {
        return cartaoRepository.findById(id)
                .map(cartaoExistente -> {
                    cartaoExistente.setNumeroCartao(cartaoAtualizado.getNumeroCartao());
                    cartaoExistente.setNomeTitular(cartaoAtualizado.getNomeTitular());
                    cartaoExistente.setDataValidade(cartaoAtualizado.getDataValidade());
                    cartaoExistente.setCvv(cartaoAtualizado.getCvv());
                    cartaoExistente.setTipoCartao(cartaoAtualizado.getTipoCartao());
                    cartaoExistente.setCpfTitular(cartaoAtualizado.getCpfTitular());
                    // idUsuario não deve ser alterado após a criação
                    return cartaoRepository.save(cartaoExistente);
                }).orElseThrow(() -> new RuntimeException("Cartão não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletarCartao(Long id) {
        cartaoRepository.deleteById(id);
    }
} 