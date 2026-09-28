package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.BeneficioRequest;
import com.korainc.conformia_api.dto.BeneficioResponse;
import com.korainc.conformia_api.dto.BeneficioAdminResponse;
import com.korainc.conformia_api.dto.BeneficioLoteRequest;
import com.korainc.conformia_api.entity.Beneficio;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.exception.BusinessException;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.mapper.BeneficioMapper;
import com.korainc.conformia_api.repository.BeneficioRepository;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BeneficioService {

    private final BeneficioRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final BeneficioMapper mapper;
    private final NotificacaoFuncionarioService notificacaoService;

    @Transactional
    public BeneficioResponse registrar(Long funcionarioId, BeneficioRequest request) {
        Funcionario funcionario = buscarFuncionario(funcionarioId);
        var existente = repository
                .findFirstByFuncionarioIdAndTipoOrderByAtualizadoEmDescIdDesc(funcionarioId, request.tipo());
        Beneficio beneficio = existente.orElseGet(() -> Beneficio.builder()
                .funcionario(funcionario)
                .tipo(request.tipo())
                .build());
        aplicarDados(beneficio, request.valor(), request.descricao());
        Beneficio salvo = repository.save(beneficio);
        existente.ifPresent(item -> notificarBeneficioAlterado(salvo));
        return mapper.toResponse(salvo);
    }

    @Transactional
    public List<BeneficioAdminResponse> registrarEmLote(BeneficioLoteRequest request) {
        List<Funcionario> funcionarios = funcionarioRepository.findAllById(request.funcionarioIds());
        if (funcionarios.size() != request.funcionarioIds().stream().distinct().count()) {
            throw new ResourceNotFoundException("Um ou mais colaboradores não foram encontrados.");
        }

        funcionarios.forEach(this::validarColaborador);

        List<Beneficio> beneficios = new ArrayList<>();
        Set<Long> funcionariosComBeneficioExistente = new HashSet<>();
        for (Funcionario funcionario : funcionarios) {
            var existente = repository
                    .findFirstByFuncionarioIdAndTipoOrderByAtualizadoEmDescIdDesc(
                            funcionario.getId(),
                            request.tipo()
                    );
            existente.ifPresent(item -> funcionariosComBeneficioExistente.add(funcionario.getId()));
            Beneficio beneficio = existente.orElseGet(() -> Beneficio.builder()
                    .funcionario(funcionario)
                    .tipo(request.tipo())
                    .build());
            aplicarDados(beneficio, request.valor(), request.descricao());
            beneficios.add(beneficio);
        }
        List<Beneficio> salvos = repository.saveAll(beneficios);
        salvos.stream()
                .filter(item -> funcionariosComBeneficioExistente.contains(item.getFuncionario().getId()))
                .forEach(this::notificarBeneficioAlterado);
        return salvos.stream()
                .map(mapper::toAdminResponse)
                .toList();
    }

    @Transactional
    public BeneficioResponse atualizar(Long id, BeneficioRequest request) {
        Beneficio beneficio = buscarEntidade(id);
        beneficio.setTipo(request.tipo());
        aplicarDados(beneficio, request.valor(), request.descricao());
        Beneficio salvo = repository.save(beneficio);
        notificarBeneficioAlterado(salvo);
        return mapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> listarDoFuncionario(Long funcionarioId) {
        return consolidarPorFuncionarioETipo(repository.findByFuncionarioIdOrderByTipoAsc(funcionarioId))
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BeneficioAdminResponse> listarTodos() {
        return consolidarPorFuncionarioETipo(repository.findAllByOrderByTipoAscFuncionarioNomeAsc()).stream()
                .filter(beneficio -> beneficio.getFuncionario().getPerfil() != Perfil.ADMIN)
                .map(mapper::toAdminResponse)
                .toList();
    }

    @Transactional
    public void inativar(Long id) {
        Beneficio beneficio = buscarEntidade(id);
        notificarBeneficioRemovido(beneficio);
        repository.delete(beneficio);
    }

    private Beneficio buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Benefício não encontrado: id " + id));
    }

    private Funcionario buscarFuncionario(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado: id " + id));
        validarColaborador(funcionario);
        return funcionario;
    }

    private void aplicarDados(Beneficio beneficio, java.math.BigDecimal valor, String descricao) {
        beneficio.setValor(valor);
        beneficio.setDescricao(descricao == null || descricao.isBlank() ? null : descricao.trim());
    }

    private void notificarBeneficioAlterado(Beneficio beneficio) {
        notificacaoService.registrarParaFuncionario(
                beneficio.getFuncionario(),
                "Benefício atualizado",
                rotuloTipo(beneficio) + " foi alterado pelo RH.",
                "rh"
        );
    }

    private void notificarBeneficioRemovido(Beneficio beneficio) {
        notificacaoService.registrarParaFuncionario(
                beneficio.getFuncionario(),
                "Benefício removido",
                rotuloTipo(beneficio) + " foi removido pelo RH.",
                "rh"
        );
    }

    private String rotuloTipo(Beneficio beneficio) {
        return beneficio.getTipo().name().replace('_', ' ');
    }

    private List<Beneficio> consolidarPorFuncionarioETipo(List<Beneficio> beneficios) {
        Map<String, Beneficio> consolidados = new LinkedHashMap<>();
        for (Beneficio beneficio : beneficios) {
            String chave = beneficio.getFuncionario().getId() + ":" + beneficio.getTipo();
            consolidados.merge(chave, beneficio, this::maisRecente);
        }
        return consolidados.values().stream()
                .sorted((a, b) -> {
                    int tipo = a.getTipo().name().compareTo(b.getTipo().name());
                    if (tipo != 0) return tipo;
                    return a.getFuncionario().getNome().compareToIgnoreCase(b.getFuncionario().getNome());
                })
                .toList();
    }

    private Beneficio maisRecente(Beneficio atual, Beneficio candidato) {
        OffsetDateTime dataAtual = Objects.requireNonNullElse(atual.getAtualizadoEm(), atual.getCriadoEm());
        OffsetDateTime dataCandidata = Objects.requireNonNullElse(candidato.getAtualizadoEm(), candidato.getCriadoEm());
        if (dataAtual == null && dataCandidata == null) {
            return candidato.getId() != null && atual.getId() != null && candidato.getId() > atual.getId()
                    ? candidato
                    : atual;
        }
        if (dataAtual == null) return candidato;
        if (dataCandidata == null) return atual;
        return dataCandidata.isAfter(dataAtual) ? candidato : atual;
    }

    private void validarColaborador(Funcionario funcionario) {
        if (funcionario.getPerfil() == Perfil.ADMIN) {
            throw new BusinessException("A conta administrativa não pode receber benefícios.");
        }
    }
}
