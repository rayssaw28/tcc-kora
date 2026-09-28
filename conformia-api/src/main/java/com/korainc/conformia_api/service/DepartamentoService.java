package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.DepartamentoRequest;
import com.korainc.conformia_api.dto.DepartamentoResponse;
import com.korainc.conformia_api.entity.Departamento;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.DepartamentoMapper;
import com.korainc.conformia_api.repository.DepartamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartamentoService {

    private final DepartamentoRepository repository;
    private final DepartamentoMapper mapper;

    @Transactional
    public DepartamentoResponse criar(DepartamentoRequest request) {
        if (repository.existsByNome(request.nome())) {
            throw new BusinessException("Já existe um departamento com o nome '" + request.nome() + "'.");
        }
        var inativoId = repository.findIdInativoByNome(request.nome());
        if (inativoId.isPresent()) {
            repository.reativar(inativoId.get(), request.descricao());
            return mapper.toResponse(buscarEntidade(inativoId.get()));
        }
        Departamento salvo = repository.save(mapper.toEntity(request));
        return mapper.toResponse(salvo);
    }

    @Transactional
    public DepartamentoResponse atualizar(Long id, DepartamentoRequest request) {
        Departamento departamento = buscarEntidade(id);
        if (!departamento.getNome().equals(request.nome()) && repository.existsByNome(request.nome())) {
            throw new BusinessException("Já existe um departamento com o nome '" + request.nome() + "'.");
        }
        mapper.updateEntity(departamento, request);
        return mapper.toResponse(repository.save(departamento));
    }

    @Transactional(readOnly = true)
    public List<DepartamentoResponse> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DepartamentoResponse buscarPorId(Long id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    @Transactional
    public void inativar(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private Departamento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado: id " + id));
    }
}
