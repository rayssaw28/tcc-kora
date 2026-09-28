package com.korainc.conformia_api.controller;

import com.korainc.conformia_api.dto.BeneficioRequest;
import com.korainc.conformia_api.dto.BeneficioResponse;
import com.korainc.conformia_api.dto.BeneficioAdminResponse;
import com.korainc.conformia_api.dto.BeneficioLoteRequest;
import com.korainc.conformia_api.security.AuthenticatedUser;
import com.korainc.conformia_api.service.BeneficioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BeneficioController {

    private final BeneficioService service;

    @GetMapping("/api/beneficios")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BeneficioAdminResponse> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping("/api/beneficios/lote")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public List<BeneficioAdminResponse> registrarEmLote(
            @Valid @RequestBody BeneficioLoteRequest request
    ) {
        return service.registrarEmLote(request);
    }

    @PostMapping("/api/funcionarios/{funcionarioId}/beneficios")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public BeneficioResponse registrar(@PathVariable Long funcionarioId,
                                       @Valid @RequestBody BeneficioRequest request) {
        return service.registrar(funcionarioId, request);
    }

    @GetMapping("/api/funcionarios/me/beneficios")
    public List<BeneficioResponse> meusBeneficios(@AuthenticationPrincipal AuthenticatedUser usuario) {
        return service.listarDoFuncionario(usuario.getId());
    }

    @GetMapping("/api/funcionarios/{funcionarioId}/beneficios")
    public List<BeneficioResponse> beneficiosDe(@PathVariable Long funcionarioId,
                                                @AuthenticationPrincipal AuthenticatedUser usuario) {
        if (!usuario.isAdmin() && !usuario.getId().equals(funcionarioId)) {
            throw new AccessDeniedException("Apenas o próprio funcionário ou o RH pode acessar benefícios.");
        }
        return service.listarDoFuncionario(funcionarioId);
    }

    @PutMapping("/api/beneficios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BeneficioResponse atualizar(@PathVariable Long id,
                                       @Valid @RequestBody BeneficioRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/api/beneficios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
