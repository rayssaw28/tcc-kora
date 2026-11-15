package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.ConsentimentoResponse;
import com.korainc.conformia_api.dto.TermoLgpdRequest;
import com.korainc.conformia_api.dto.TermoLgpdResponse;
import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import com.korainc.conformia_api.entity.TermoLgpd;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.ConsentimentoMapper;
import com.korainc.conformia_api.repository.ConsentimentoLgpdRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.HistoricoAlteracaoFuncionarioRepository;
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
    private final HistoricoAlteracaoFuncionarioRepository historicoRepository;
    private final ConsentimentoMapper mapper;

    @Transactional
    public ConsentimentoResponse registrar(Long funcionarioId, String ipOrigem) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + funcionarioId));
        TermoLgpd termo = buscarTermoAtual();

        // Idempotente apenas se o estado atual (último registro) já é o aceite deste termo.
        // Após uma revogação, um novo aceite precisa gerar um novo registro.
        var ultimo = repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(funcionarioId);
        if (ultimo.isPresent()
                && ultimo.get().isAceito()
                && termo.getVersao().equals(ultimo.get().getVersaoTermo())
                && termo.getUrl().equals(ultimo.get().getUrlTermo())) {
            return mapper.toResponse(ultimo.get());
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

    /**
     * Revoga o consentimento vigente (LGPD art. 8º, §5º). O log é append-only: a revogação é
     * um novo registro com {@code aceito = false}, preservando o histórico do aceite original.
     * Idempotente: se o estado atual já é "revogado", devolve o registro de revogação existente.
     */
    @Transactional
    public ConsentimentoResponse revogar(Long funcionarioId, String ipOrigem) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + funcionarioId));

        ConsentimentoLgpd ultimo = repository
                .findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(funcionarioId)
                .orElseThrow(() -> new BusinessException("Não há consentimento registrado para revogar."));

        if (!ultimo.isAceito()) {
            return mapper.toResponse(ultimo);
        }

        ConsentimentoLgpd revogacao = ConsentimentoLgpd.builder()
                .funcionario(funcionario)
                .versaoTermo(ultimo.getVersaoTermo())
                .urlTermo(ultimo.getUrlTermo())
                .aceito(false)
                .ipOrigem(ipOrigem)
                .build();

        return mapper.toResponse(repository.save(revogacao));
    }

    /**
     * Revogação registrada pelo ADMIN a pedido do titular. Além do log de consentimento,
     * grava no histórico de alterações quem a executou, já que o log não guarda o autor.
     */
    @Transactional
    public ConsentimentoResponse revogarPorAdmin(Long funcionarioId, String ipOrigem,
                                                 Long adminId, String adminNome) {
        var ultimo = repository.findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(funcionarioId);
        boolean estavaAceito = ultimo.isPresent() && ultimo.get().isAceito();

        ConsentimentoResponse resposta = revogar(funcionarioId, ipOrigem);

        if (estavaAceito) {
            historicoRepository.save(HistoricoAlteracaoFuncionario.builder()
                    .funcionario(funcionarioRepository.getReferenceById(funcionarioId))
                    .alteradoPorId(adminId)
                    .alteradoPorNome(adminNome)
                    .campo("Consentimento LGPD")
                    .valorAnterior("Aceito (versão " + ultimo.get().getVersaoTermo() + ")")
                    .valorNovo("Revogado a pedido do titular")
                    .build());
        }
        return resposta;
    }

    @Transactional(readOnly = true)
    public List<ConsentimentoResponse> historicoDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdOrderByRegistradoEmDescIdDesc(funcionarioId)
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
