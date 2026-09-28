package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.RequisitoDocumentoRequest;
import com.korainc.conformia_api.dto.RequisitoDocumentoResponse;
import com.korainc.conformia_api.entity.RequisitoDocumento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.repository.RequisitoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequisitoDocumentoService {

    private final RequisitoDocumentoRepository repository;
    private final NotificacaoFuncionarioService notificacaoService;

    @Transactional(readOnly = true)
    public List<RequisitoDocumentoResponse> listar() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .sorted(java.util.Comparator.comparing(
                        RequisitoDocumentoResponse::titulo,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public RequisitoDocumentoResponse criar(RequisitoDocumentoRequest request) {
        String titulo = request.titulo().trim();
        if (repository.existsByTituloIgnoreCase(titulo)) {
            throw new BusinessException("Já existe um documento exigido com esse nome.");
        }
        var inativoId = repository.findIdInativoByTitulo(titulo);
        if (inativoId.isPresent()) {
            repository.reativar(
                    inativoId.get(),
                    titulo,
                    request.tipo().name(),
                    limpar(request.descricao())
            );
            RequisitoDocumentoResponse response = toResponse(buscar(inativoId.get()));
            notificarNovoDocumento(response);
            return response;
        }
        RequisitoDocumentoResponse response = toResponse(repository.save(RequisitoDocumento.builder()
                .titulo(titulo)
                .tipo(request.tipo())
                .descricao(limpar(request.descricao()))
                .build()));
        notificarNovoDocumento(response);
        return response;
    }

    @Transactional
    public RequisitoDocumentoResponse atualizar(Long id, RequisitoDocumentoRequest request) {
        RequisitoDocumento requisito = buscar(id);
        String titulo = request.titulo().trim();
        repository.findByTituloIgnoreCase(titulo)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new BusinessException("Já existe um documento exigido com esse nome.");
                });
        requisito.setTitulo(titulo);
        requisito.setTipo(request.tipo());
        requisito.setDescricao(limpar(request.descricao()));
        return toResponse(repository.save(requisito));
    }

    @Transactional
    public void remover(Long id) {
        repository.delete(buscar(id));
    }

    public RequisitoDocumento buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documento exigido não encontrado: id " + id));
    }

    private RequisitoDocumentoResponse toResponse(RequisitoDocumento requisito) {
        return new RequisitoDocumentoResponse(
                requisito.getId(),
                requisito.getTitulo(),
                requisito.getTipo(),
                requisito.getDescricao());
    }

    private String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private void notificarNovoDocumento(RequisitoDocumentoResponse requisito) {
        notificacaoService.registrarParaColaboradoresAtivos(
                "Novo documento solicitado",
                "O RH solicitou o envio de " + requisito.titulo() + ".",
                "arquivos"
        );
    }
}
