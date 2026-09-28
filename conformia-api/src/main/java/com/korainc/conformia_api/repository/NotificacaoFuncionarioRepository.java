package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.NotificacaoFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacaoFuncionarioRepository extends JpaRepository<NotificacaoFuncionario, Long> {

    List<NotificacaoFuncionario> findByFuncionarioIdAndAtivoTrueOrderByCriadoEmDesc(Long funcionarioId);
}
