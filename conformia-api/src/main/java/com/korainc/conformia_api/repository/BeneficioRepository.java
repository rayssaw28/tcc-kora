package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Beneficio;
import com.korainc.conformia_api.enums.TipoBeneficio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficioRepository extends JpaRepository<Beneficio, Long> {

    List<Beneficio> findByFuncionarioIdOrderByTipoAsc(Long funcionarioId);

    List<Beneficio> findByFuncionarioIdAndTipoOrderByAtualizadoEmDescIdDesc(
            Long funcionarioId,
            TipoBeneficio tipo
    );

    Optional<Beneficio> findFirstByFuncionarioIdAndTipoOrderByAtualizadoEmDescIdDesc(
            Long funcionarioId,
            TipoBeneficio tipo
    );

    List<Beneficio> findAllByOrderByTipoAscFuncionarioNomeAsc();
}
