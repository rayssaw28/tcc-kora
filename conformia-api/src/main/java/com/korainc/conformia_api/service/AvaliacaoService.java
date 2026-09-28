package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.AvaliacaoItemRequest;
import com.korainc.conformia_api.dto.AvaliacaoRequest;
import com.korainc.conformia_api.dto.AvaliacaoResponse;
import com.korainc.conformia_api.dto.AvaliacaoUpdateRequest;
import com.korainc.conformia_api.dto.FeedbackRequest;
import com.korainc.conformia_api.entity.AvaliacaoDesempenho;
import com.korainc.conformia_api.entity.AvaliacaoItem;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.StatusAvaliacao;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.AvaliacaoMapper;
import com.korainc.conformia_api.repository.AvaliacaoDesempenhoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoDesempenhoRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final AvaliacaoMapper mapper;

    @Transactional
    public AvaliacaoResponse criar(Long avaliadorId, AvaliacaoRequest request) {
        Funcionario avaliado = buscarFuncionario(request.avaliadoId());
        Funcionario avaliador = buscarFuncionario(avaliadorId);
        AvaliacaoDesempenho avaliacao = novaAvaliacao(
                avaliado,
                avaliador,
                request.periodo(),
                request.comentarioGeral(),
                request.itens()
        );
        return mapper.toResponse(repository.save(avaliacao));
    }

    @Transactional
    public AvaliacaoResponse enviarFeedback(Long avaliadorId, FeedbackRequest request) {
        if (avaliadorId.equals(request.destinatarioId())) {
            throw new BusinessException("Não é possível enviar feedback para si mesmo.");
        }
        Funcionario avaliado = buscarFuncionario(request.destinatarioId());
        Funcionario avaliador = buscarFuncionario(avaliadorId);
        if (avaliado.getStatusAdmissao() != StatusAdmissao.ATIVO) {
            throw new BusinessException("O destinatario precisa ser um colaborador ativo.");
        }
        if (avaliado.getDepartamento() != null
                && "Presidencia".equalsIgnoreCase(
                        java.text.Normalizer.normalize(
                                avaliado.getDepartamento().getNome(),
                                java.text.Normalizer.Form.NFD
                        ).replaceAll("\\p{M}", ""))) {
            throw new BusinessException("Não é possível enviar feedback para a Presidência.");
        }
        AvaliacaoDesempenho feedback = novaAvaliacao(
                avaliado,
                avaliador,
                request.periodo(),
                request.comentario(),
                request.criterios()
        );
        return mapper.toResponse(repository.save(feedback));
    }

    private AvaliacaoDesempenho novaAvaliacao(
            Funcionario avaliado,
            Funcionario avaliador,
            String periodo,
            String comentario,
            List<AvaliacaoItemRequest> itens
    ) {
        AvaliacaoDesempenho avaliacao = AvaliacaoDesempenho.builder()
                .avaliado(avaliado)
                .avaliador(avaliador)
                .periodo(periodo.trim())
                .comentarioGeral(comentario != null ? comentario.trim() : null)
                .status(StatusAvaliacao.RASCUNHO)
                .build();
        substituirItens(avaliacao, itens);
        return avaliacao;
    }

    @Transactional
    public AvaliacaoResponse atualizar(Long id, AvaliacaoUpdateRequest request) {
        AvaliacaoDesempenho avaliacao = buscarEntidade(id);
        exigirRascunho(avaliacao);
        avaliacao.setPeriodo(request.periodo().trim());
        avaliacao.setComentarioGeral(
                request.comentarioGeral() != null ? request.comentarioGeral().trim() : null);
        substituirItens(avaliacao, request.itens());
        return mapper.toResponse(repository.save(avaliacao));
    }

    @Transactional
    public AvaliacaoResponse finalizar(Long id) {
        AvaliacaoDesempenho avaliacao = buscarEntidade(id);
        exigirRascunho(avaliacao);
        if (avaliacao.getItens().isEmpty()) {
            avaliacao.setNotaFinal(null);
        } else {
            double media = avaliacao.getItens().stream()
                    .mapToInt(AvaliacaoItem::getNota)
                    .average()
                    .orElse(0);
            avaliacao.setNotaFinal(Math.round(media * 100.0) / 100.0);
        }
        avaliacao.setStatus(StatusAvaliacao.FINALIZADA);
        return mapper.toResponse(repository.save(avaliacao));
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponse buscarPorId(Long id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByAvaliadoIdOrderByCriadoEmDesc(funcionarioId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarEnviadas(Long avaliadorId) {
        return repository.findByAvaliadorIdOrderByCriadoEmDesc(avaliadorId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Long avaliadoIdDe(Long id) {
        return buscarEntidade(id).getAvaliado().getId();
    }

    @Transactional(readOnly = true)
    public Long avaliadorIdDe(Long id) {
        return buscarEntidade(id).getAvaliador().getId();
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private void substituirItens(
            AvaliacaoDesempenho avaliacao,
            List<AvaliacaoItemRequest> itens
    ) {
        avaliacao.getItens().clear();
        for (AvaliacaoItemRequest req : itens != null ? itens : List.<AvaliacaoItemRequest>of()) {
            avaliacao.getItens().add(AvaliacaoItem.builder()
                    .avaliacao(avaliacao)
                    .criterio(req.criterio())
                    .nota(req.nota())
                    .comentario(req.comentario())
                    .build());
        }
    }

    private void exigirRascunho(AvaliacaoDesempenho avaliacao) {
        if (avaliacao.getStatus() != StatusAvaliacao.RASCUNHO) {
            throw new BusinessException(
                    "Só é possível editar ou finalizar uma avaliação em rascunho.");
        }
    }

    private AvaliacaoDesempenho buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Avaliação não encontrada: id " + id));
    }

    private Funcionario buscarFuncionario(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + id));
    }
}
