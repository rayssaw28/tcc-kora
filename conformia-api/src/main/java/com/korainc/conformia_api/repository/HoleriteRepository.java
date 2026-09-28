package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Holerite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HoleriteRepository extends JpaRepository<Holerite, Long> {

    List<Holerite> findByFuncionarioIdOrderByAnoDescMesDesc(Long funcionarioId);

    List<Holerite> findAllByOrderByAnoDescMesDesc();

    Optional<Holerite> findByFuncionarioIdAndAnoAndMes(Long funcionarioId, int ano, int mes);

    boolean existsByFuncionarioIdAndAnoAndMes(Long funcionarioId, int ano, int mes);
}
