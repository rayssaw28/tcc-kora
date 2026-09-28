package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.AvaliacaoResponse;
import com.korainc.conformia_api.dto.AvaliacaoUpdateRequest;
import com.korainc.conformia_api.dto.FeedbackRequest;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.AvaliacaoService;
import com.korainc.conformia_api.service.EscopoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService service;
    private final EscopoService escopoService;

    @PostMapping("/api/feedbacks")
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoResponse enviarFeedback(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody FeedbackRequest request
    ) {
        bloquearAdmin(usuario);
        return service.enviarFeedback(usuario.getId(), request);
    }

    @PutMapping("/api/avaliacoes/{id}")
    public AvaliacaoResponse atualizar(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody AvaliacaoUpdateRequest request
    ) {
        validarAutor(usuario, id);
        return service.atualizar(id, request);
    }

    @PostMapping("/api/avaliacoes/{id}/finalizar")
    public AvaliacaoResponse finalizar(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        validarAutor(usuario, id);
        return service.finalizar(id);
    }

    @DeleteMapping("/api/avaliacoes/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        validarAutor(usuario, id);
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/avaliacoes/{id}")
    public AvaliacaoResponse buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        AvaliacaoResponse resposta = service.buscarPorId(id);
        if (!usuario.getId().equals(resposta.avaliadorId())) {
            escopoService.validarAcesso(usuario, resposta.avaliadoId());
        }
        return resposta;
    }

    @GetMapping("/api/funcionarios/me/avaliacoes")
    public List<AvaliacaoResponse> minhasAvaliacoes(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/me/avaliacoes-enviadas")
    public List<AvaliacaoResponse> avaliacoesEnviadas(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarEnviadas(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/avaliacoes")
    public List<AvaliacaoResponse> avaliacoesDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        escopoService.validarAcesso(usuario, funcionarioId);
        return service.listarDoFuncionario(funcionarioId);
    }

    private void validarAutor(AuthenticatedUser usuario, Long avaliacaoId) {
        bloquearAdmin(usuario);
        if (!usuario.getId().equals(service.avaliadorIdDe(avaliacaoId))) {
            throw new AccessDeniedException(
                    "Apenas quem criou a avaliação pode alterá-la.");
        }
    }

    private void bloquearAdmin(AuthenticatedUser usuario) {
        if (usuario.isAdmin()) {
            throw new AccessDeniedException(
                    "A conta administrativa não cria nem modifica avaliações.");
        }
    }
}
