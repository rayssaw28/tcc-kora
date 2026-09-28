package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.ConsentimentoResponse;
import com.korainc.conformia_api.dto.TermoLgpdRequest;
import com.korainc.conformia_api.dto.TermoLgpdResponse;
import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.TermoLgpd;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.ConsentimentoMapper;
import com.korainc.conformia_api.repository.ConsentimentoLgpdRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.TermoLgpdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsentimentoService {

    private final ConsentimentoLgpdRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final TermoLgpdRepository termoRepository;
    private final ConsentimentoMapper mapper;

    @Transactional
    public ConsentimentoResponse registrar(Long funcionarioId, String ipOrigem) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + funcionarioId));
        TermoLgpd termo = buscarTermoAtual();

        var existente = repository
                .findFirstByFuncionarioIdAndVersaoTermoAndUrlTermoAndAceitoTrueOrderByRegistradoEmDesc(
                        funcionarioId, termo.getVersao(), termo.getUrl());
        if (existente.isPresent()) {
            return mapper.toResponse(existente.get());
        }

        ConsentimentoLgpd consentimento = ConsentimentoLgpd.builder()
                .funcionario(funcionario)
                .versaoTermo(termo.getVersao())
                .urlTermo(termo.getUrl())
                .aceito(true)
                .ipOrigem(ipOrigem)
                .build();

        return mapper.toResponse(repository.save(consentimento));
    }

    @Transactional(readOnly = true)
    public List<ConsentimentoResponse> historicoDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdOrderByRegistradoEmDesc(funcionarioId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TermoLgpdResponse termoAtual() {
        return toResponse(buscarTermoAtual());
    }

    @Transactional
    public TermoLgpdResponse publicar(TermoLgpdRequest request) {
        String versao = request.versao().trim();
        if (termoRepository.existsByVersao(versao)) {
            throw new BusinessException("Já existe um termo LGPD com a versão '" + versao + "'.");
        }
        TermoLgpd termo = TermoLgpd.builder()
                .versao(versao)
                .url(request.url().trim())
                .build();
        return toResponse(termoRepository.save(termo));
    }

    private TermoLgpd buscarTermoAtual() {
        return termoRepository.findFirstByOrderByPublicadoEmDescIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum termo LGPD foi publicado."));
    }

    private TermoLgpdResponse toResponse(TermoLgpd termo) {
        return new TermoLgpdResponse(termo.getVersao(), termo.getUrl(), termo.getPublicadoEm());
    }
}
