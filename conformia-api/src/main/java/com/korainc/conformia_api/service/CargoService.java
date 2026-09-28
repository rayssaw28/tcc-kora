package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.CargoRequest;
import com.korainc.conformia_api.dto.CargoResponse;
import com.korainc.conformia_api.entity.Cargo;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.CargoMapper;
import com.korainc.conformia_api.repository.CargoRepository;
import com.korainc.conformia_api.repository.DepartamentoRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository repository;
    private final DepartamentoRepository departamentoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final CargoMapper mapper;

    @Transactional
    public CargoResponse criar(CargoRequest request) {
        if (repository.existsByNome(request.nome())) {
            throw new BusinessException("Já existe um cargo com o nome '" + request.nome() + "'.");
        }
        var departamento = resolverDepartamento(request.departamentoId());
        Funcionario lider = resolverLider(request.liderDiretoId());
        var inativoId = repository.findIdInativoByNome(request.nome());
        if (inativoId.isPresent()) {
            repository.reativar(
                    inativoId.get(),
                    request.descricao(),
                    departamento.getId(),
                    lider != null ? lider.getId() : null
            );
            return mapper.toResponse(buscarEntidade(inativoId.get()));
        }
        Cargo cargo = mapper.toEntity(request);
        cargo.setDepartamento(departamento);
        cargo.setLiderDireto(lider);
        Cargo salvo = repository.save(cargo);
        return mapper.toResponse(salvo);
    }

    @Transactional
    public CargoResponse atualizar(Long id, CargoRequest request) {
        Cargo cargo = buscarEntidade(id);
        if (!cargo.getNome().equals(request.nome()) && repository.existsByNome(request.nome())) {
            throw new BusinessException("Já existe um cargo com o nome '" + request.nome() + "'.");
        }
        mapper.updateEntity(cargo, request);
        var departamento = resolverDepartamento(request.departamentoId());
        cargo.setDepartamento(departamento);
        cargo.setLiderDireto(resolverLider(request.liderDiretoId()));
        Cargo salvo = repository.save(cargo);
        sincronizarLiderDosOcupantes(salvo);
        return mapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<CargoResponse> listar() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CargoResponse buscarPorId(Long id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    @Transactional
    public void inativar(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private Cargo buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo não encontrado: id " + id));
    }

    private com.korainc.conformia_api.entity.Departamento resolverDepartamento(Long id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Departamento não encontrado: id " + id));
    }

    private Funcionario resolverLider(Long id) {
        if (id == null) {
            return null;
        }
        Funcionario lider = funcionarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Líder direto não encontrado: id " + id));
        if (lider.getPerfil() == com.korainc.conformia_api.enums.Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode ser líder de um cargo.");
        }
        return lider;
    }

    private void sincronizarLiderDosOcupantes(Cargo cargo) {
        for (Funcionario funcionario : funcionarioRepository.findByCargoId(cargo.getId())) {
            if (cargo.getLiderDireto() != null
                    && cargo.getLiderDireto().getId().equals(funcionario.getId())) {
                throw new BusinessException(
                        "O ocupante do cargo não pode ser o próprio líder direto.");
            }
            validarSemCiclo(funcionario, cargo.getLiderDireto());
            funcionario.setGestor(cargo.getLiderDireto());
            funcionarioRepository.save(funcionario);
        }
    }

    private void validarSemCiclo(Funcionario funcionario, Funcionario lider) {
        Funcionario atual = lider;
        var visitados = new java.util.HashSet<Long>();
        while (atual != null && visitados.add(atual.getId())) {
            if (atual.getId().equals(funcionario.getId())) {
                throw new BusinessException(
                        "O líder selecionado criaria um ciclo no organograma.");
            }
            atual = atual.getGestor();
        }
    }
}
