package com.korainc.conformia_api.service;

import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EscopoService {

    private static final int LIMITE_PROFUNDIDADE = 100;

    private final FuncionarioRepository funcionarioRepository;

    @Transactional(readOnly = true)
    public boolean estaNoEscopoDoGestor(Long gestorId, Long alvoId) {
        if (gestorId == null || alvoId == null || gestorId.equals(alvoId)) {
            return false;
        }
        Long atualId = alvoId;
        Set<Long> visitados = new HashSet<>();
        int guard = 0;

        while (atualId != null && guard++ < LIMITE_PROFUNDIDADE && visitados.add(atualId)) {
            Funcionario atual = funcionarioRepository.findById(atualId).orElse(null);
            if (atual == null || atual.getGestor() == null) {
                return false;
            }
            Long chefeId = atual.getGestor().getId();
            if (gestorId.equals(chefeId)) {
                return true;
            }
            atualId = chefeId;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean podeAcessar(AuthenticatedUser usuario, Long alvoId) {
        if (usuario.isAdmin()) {
            return true;
        }
        if (usuario.getId().equals(alvoId)) {
            return true;
        }
        return usuario.getFuncionario().getPerfil() == Perfil.GESTOR
                && estaNoEscopoDoGestor(usuario.getId(), alvoId);
    }

    public void validarAcesso(AuthenticatedUser usuario, Long alvoId) {
        if (!podeAcessar(usuario, alvoId)) {
            throw new AccessDeniedException("Você não tem acesso aos dados deste funcionário.");
        }
    }

    @Transactional(readOnly = true)
    public List<Long> idsSubordinados(Long gestorId) {
        List<Long> resultado = new ArrayList<>();
        Set<Long> visitados = new HashSet<>();
        Deque<Long> fila = new ArrayDeque<>();
        fila.add(gestorId);
        int guard = 0;
        while (!fila.isEmpty() && guard++ < 10_000) {
            Long atual = fila.poll();
            for (Funcionario sub : funcionarioRepository.findByGestorId(atual)) {
                if (visitados.add(sub.getId())) {
                    resultado.add(sub.getId());
                    fila.add(sub.getId());
                }
            }
        }
        return resultado;
    }
}
