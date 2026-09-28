package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.OrganogramaNode;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.exception.ResourceNotFoundException;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganogramaService {

    private final FuncionarioRepository repository;

    @Transactional(readOnly = true)
    public List<OrganogramaNode> completo() {
        List<Funcionario> todos = repository.findAllParaOrganograma();
        Set<Long> idsExistentes = todos.stream().map(Funcionario::getId).collect(Collectors.toSet());
        Map<Long, List<Funcionario>> filhosPorGestor = agruparPorGestor(todos);

        List<Funcionario> raizes = todos.stream()
                .filter(f -> idDoGestor(f) == null || !idsExistentes.contains(idDoGestor(f)))
                .sorted(comparadorOrganizacional())
                .toList();

        return raizes.stream()
                .map(raiz -> construir(raiz, filhosPorGestor, new HashSet<>()))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganogramaNode subarvore(Long funcionarioId) {
        List<Funcionario> todos = repository.findAllParaOrganograma();
        Funcionario raiz = todos.stream()
                .filter(f -> f.getId().equals(funcionarioId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Funcionário não encontrado: id " + funcionarioId));

        Map<Long, List<Funcionario>> filhosPorGestor = agruparPorGestor(todos);
        return construir(raiz, filhosPorGestor, new HashSet<>());
    }

    private Map<Long, List<Funcionario>> agruparPorGestor(List<Funcionario> todos) {
        Map<Long, List<Funcionario>> mapa = new HashMap<>();
        for (Funcionario f : todos) {
            Long gestorId = idDoGestor(f);
            if (gestorId != null) {
                mapa.computeIfAbsent(gestorId, k -> new ArrayList<>()).add(f);
            }
        }
        return mapa;
    }

    private Long idDoGestor(Funcionario f) {
        return f.getGestor() != null ? f.getGestor().getId() : null;
    }

    private OrganogramaNode construir(Funcionario f, Map<Long, List<Funcionario>> filhosPorGestor,
                                      Set<Long> visitados) {

        if (!visitados.add(f.getId())) {
            return no(f, List.of());
        }
        List<OrganogramaNode> filhos = filhosPorGestor.getOrDefault(f.getId(), List.of()).stream()
                .sorted(comparadorOrganizacional())
                .map(filho -> construir(filho, filhosPorGestor, visitados))
                .toList();
        return no(f, filhos);
    }

    private OrganogramaNode no(Funcionario f, List<OrganogramaNode> subordinados) {
        return new OrganogramaNode(
                f.getId(),
                f.getNome(),
                f.getCargo() != null ? f.getCargo().getNome() : null,
                f.getDepartamento() != null ? f.getDepartamento().getNome() : null,
                f.getPerfil(),
                subordinados
        );
    }

    private Comparator<Funcionario> comparadorOrganizacional() {
        return Comparator
                .comparing(
                        (Funcionario funcionario) -> funcionario.getDepartamento() != null
                                ? funcionario.getDepartamento().getNome()
                                : "",
                        String.CASE_INSENSITIVE_ORDER
                )
                .thenComparing(
                        Funcionario::getNome,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                );
    }
}
