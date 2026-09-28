package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.DadosBancarios;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DadosBancariosRepository extends JpaRepository<DadosBancarios, Long> {

    Optional<DadosBancarios> findByFuncionarioId(Long funcionarioId);

    boolean existsByFuncionarioId(Long funcionarioId);
}
