package com.korainc.conformia_api.service;

import com.korainc.conformia_api.dto.NotificacaoFuncionarioResponse;
import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.entity.NotificacaoFuncionario;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.repository.FuncionarioRepository;
import com.korainc.conformia_api.repository.NotificacaoFuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacaoFuncionarioService {

    private final NotificacaoFuncionarioRepository repository;
    private final FuncionarioRepository funcionarioRepository;

    @Transactional(readOnly = true)
    public List<NotificacaoFuncionarioResponse> listarDoFuncionario(Long funcionarioId) {
        return repository.findByFuncionarioIdAndAtivoTrueOrderByCriadoEmDesc(funcionarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void registrarParaFuncionario(Funcionario funcionario, String titulo, String descricao, String aba) {
        if (funcionario == null || funcionario.getPerfil() == Perfil.ADMIN) {
            return;
        }
        repository.save(NotificacaoFuncionario.builder()
                .funcionario(funcionario)
                .titulo(titulo)
                .descricao(descricao)
                .aba(aba)
                .build());
    }

    @Transactional
    public void registrarParaColaboradoresAtivos(String titulo, String descricao, String aba) {
        funcionarioRepository.findByPerfilNot(Perfil.ADMIN).forEach(
                funcionario -> registrarParaFuncionario(funcionario, titulo, descricao, aba)
        );
    }

    private NotificacaoFuncionarioResponse toResponse(NotificacaoFuncionario notificacao) {
        return new NotificacaoFuncionarioResponse(
                notificacao.getId(),
                notificacao.getTitulo(),
                notificacao.getDescricao(),
                notificacao.getAba(),
                notificacao.getCriadoEm()
        );
    }
}
