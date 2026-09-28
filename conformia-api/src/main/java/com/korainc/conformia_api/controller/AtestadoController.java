package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.AtestadoResponse;
import com.korainc.conformia_api.dto.MotivoReprovacaoRequest;
import jakarta.validation.Valid;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.AtestadoService;
import com.korainc.conformia_api.service.EscopoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
public class AtestadoController {

    private final AtestadoService service;
    private final EscopoService escopoService;

    @PostMapping(value = "/api/funcionarios/me/atestados", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AtestadoResponse enviarMeu(@AuthenticationPrincipal AuthenticatedUser usuario,
                                      @RequestParam("file") MultipartFile file,
                                      @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
                                      @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
                                      @RequestParam(value = "observacao", required = false) String observacao) {
        return service.enviar(usuario.getId(), file, dataInicio, dataFim, observacao);
    }

    @GetMapping("/api/funcionarios/me/atestados")
    public List<AtestadoResponse> listarMeus(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/atestados/pendentes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AtestadoResponse> listarPendentes() {
        return service.listarPendentes();
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/atestados")
    public List<AtestadoResponse> listarDe(@PathVariable Long funcionarioId,
                                           @AuthenticationPrincipal AuthenticatedUser usuario) {
        escopoService.validarAcesso(usuario, funcionarioId);
        return service.listarDoFuncionario(funcionarioId);
    }

    @GetMapping("/api/atestados/{id}/download")
    public ResponseEntity<?> baixar(@PathVariable Long id,
                                    @AuthenticationPrincipal AuthenticatedUser usuario) {
        AtestadoResponse atestado = service.buscar(id);
        if (!escopoService.podeAcessar(usuario, atestado.funcionarioId())) {
            throw new AccessDeniedException("Você não tem acesso a este atestado.");
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(UriComponentsBuilder.fromUriString("https://example.com/")
                        .queryParam("arquivo", atestado.nomeArquivo())
                        .build()
                        .encode()
                        .toUri())
                .build();
    }

    @PostMapping("/api/atestados/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public AtestadoResponse aprovar(@PathVariable Long id) {
        return service.aprovar(id);
    }

    @PostMapping("/api/atestados/{id}/reprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public AtestadoResponse reprovar(
            @PathVariable Long id,
            @Valid @org.springframework.web.bind.annotation.RequestBody MotivoReprovacaoRequest request
    ) {
        return service.reprovar(id, request.motivo());
    }

    @DeleteMapping("/api/atestados/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id,
                                         @AuthenticationPrincipal AuthenticatedUser usuario) {
        if (!usuario.isAdmin() && !usuario.getId().equals(service.funcionarioDono(id))) {
            throw new AccessDeniedException("Você não pode remover este atestado.");
        }
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
