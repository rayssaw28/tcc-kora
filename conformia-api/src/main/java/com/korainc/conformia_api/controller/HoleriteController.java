package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.DemonstrativoHoleriteResponse;
import com.korainc.conformia_api.dto.HoleriteResponse;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.HoleriteService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
public class HoleriteController {

    private final HoleriteService service;

    @GetMapping("/api/holerites")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HoleriteResponse> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/api/holerites/demonstrativos")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    public List<DemonstrativoHoleriteResponse> listarDemonstrativos(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarDemonstrativos(usuario);
    }

    @PostMapping(value = "/api/funcionarios/{funcionarioId}/holerites", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public HoleriteResponse enviar(@PathVariable Long funcionarioId,
                                   @RequestParam("file") MultipartFile file,
                                   @RequestParam("mes") int mes,
                                   @RequestParam("ano") int ano) {
        return service.enviar(funcionarioId, file, mes, ano);
    }

    @GetMapping("/api/funcionarios/me/holerites")
    public List<HoleriteResponse> listarMeus(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/me/holerites/demonstrativos")
    public List<DemonstrativoHoleriteResponse> listarMeusDemonstrativos(
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarDemonstrativosDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/holerites")
    public List<HoleriteResponse> listarDe(@PathVariable Long funcionarioId,
                                           @AuthenticationPrincipal AuthenticatedUser usuario) {
        validarProprioOuAdmin(usuario, funcionarioId);
        return service.listarDoFuncionario(funcionarioId);
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/holerites/demonstrativos")
    public List<DemonstrativoHoleriteResponse> listarDemonstrativosDe(
            @PathVariable Long funcionarioId,
            @AuthenticationPrincipal AuthenticatedUser usuario
    ) {
        return service.listarDemonstrativosDe(funcionarioId, usuario);
    }

    @GetMapping("/api/holerites/{id}/download")
    public ResponseEntity<?> baixar(@PathVariable Long id,
                                    @AuthenticationPrincipal AuthenticatedUser usuario) {
        HoleriteResponse holerite = service.buscar(id);
        if (!usuario.isAdmin() && !usuario.getId().equals(holerite.funcionarioId())) {
            throw new AccessDeniedException("Você não tem acesso a este holerite.");
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(UriComponentsBuilder.fromUriString("https://example.com/")
                        .queryParam("arquivo", holerite.nomeArquivo())
                        .build()
                        .encode()
                        .toUri())
                .build();
    }

    @DeleteMapping("/api/holerites/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    private void validarProprioOuAdmin(AuthenticatedUser usuario, Long funcionarioId) {
        if (!usuario.isAdmin() && !usuario.getId().equals(funcionarioId)) {
            throw new AccessDeniedException("Apenas o próprio funcionário ou o RH pode acessar holerites.");
        }
    }
}
