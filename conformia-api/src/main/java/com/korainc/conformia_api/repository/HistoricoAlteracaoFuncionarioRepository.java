package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.HistoricoAlteracaoFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoAlteracaoFuncionarioRepository
        extends JpaRepository<HistoricoAlteracaoFuncionario, Long> {

    List<HistoricoAlteracaoFuncionario> findByFuncionarioIdOrderByAlteradoEmDesc(Long funcionarioId);
}
