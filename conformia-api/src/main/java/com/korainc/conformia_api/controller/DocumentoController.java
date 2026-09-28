package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.DocumentoResponse;
import com.korainc.conformia_api.dto.DocumentosPessoaisRequest;
import com.korainc.conformia_api.dto.DocumentosPessoaisResponse;
import com.korainc.conformia_api.dto.MotivoReprovacaoRequest;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.DocumentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService service;

    @PostMapping(
            value = "/api/funcionarios/me/documentos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoResponse enviarMeu(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @RequestParam("file") MultipartFile file,
            @RequestParam("requisitoId") Long requisitoId
    ) {
        if (usuario.isAdmin()) {
            throw new AccessDeniedException(
                    "A conta administrativa não envia documentos pessoais.");
        }
        return service.enviar(usuario.getId(), file, requisitoId);
    }

    @PostMapping(
            value = "/api/funcionarios/{funcionarioId}/documentos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentoResponse enviarPara(
            @PathVariable Long funcionarioId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("requisitoId") Long requisitoId
    ) {
        return service.enviar(funcionarioId, file, requisitoId);
    }

    @GetMapping("/api/funcionarios/me/documentos")
    public List<DocumentoResponse> listarMeus(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/documentos")
    public List<DocumentoResponse> listarDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        validarProprioOuAdmin(usuario, funcionarioId);
        return service.listarDoFuncionario(funcionarioId);
    }

    @GetMapping("/api/funcionarios/me/documentos-pessoais")
    public DocumentosPessoaisResponse meusDadosDocumentais(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.buscarDadosPessoais(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/documentos-pessoais")
    public DocumentosPessoaisResponse dadosDocumentaisDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        validarProprioOuAdmin(usuario, funcionarioId);
        return service.buscarDadosPessoais(funcionarioId);
    }

    @PutMapping("/api/funcionarios/me/documentos-pessoais")
    public DocumentosPessoaisResponse atualizarMeusDadosDocumentais(
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody DocumentosPessoaisRequest request
    ) {
        return service.atualizarDadosPessoais(
                usuario.getId(),
                usuario.getId(),
                usuario.getFuncionario().getNome(),
                request
        );
    }

    @PutMapping("/api/funcionarios/{funcionarioId}/documentos-pessoais")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentosPessoaisResponse atualizarDadosDocumentaisDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario,
            @Valid @RequestBody DocumentosPessoaisRequest request
    ) {
        return service.atualizarDadosPessoais(
                funcionarioId,
                usuario.getId(),
                usuario.getFuncionario().getNome(),
                request
        );
    }

    @GetMapping("/api/documentos/{id}/download")
    public ResponseEntity<?> baixar(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        DocumentoResponse documento = service.buscar(id);
        if (!usuario.isAdmin() && !usuario.getId().equals(documento.funcionarioId())) {
            throw new AccessDeniedException("Você não tem acesso a este documento.");
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(UriComponentsBuilder.fromUriString("https://example.com/")
                        .queryParam("arquivo", documento.nomeArquivo())
                        .build()
                        .encode()
                        .toUri())
                .build();
    }

    @PostMapping("/api/documentos/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentoResponse aprovar(@PathVariable Long id) {
        return service.aprovar(id);
    }

    @PostMapping("/api/documentos/{id}/reprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentoResponse reprovar(
            @PathVariable Long id,
            @Valid @RequestBody MotivoReprovacaoRequest request
    ) {
        return service.reprovar(id, request.motivo());
    }

    @DeleteMapping("/api/documentos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    private void validarProprioOuAdmin(AuthenticatedUser usuario, Long funcionarioId) {
        if (!usuario.isAdmin() && !usuario.getId().equals(funcionarioId)) {
            throw new AccessDeniedException("Apenas o próprio funcionário ou o RH pode acessar documentos.");
        }
    }
}
