package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.EspelhoPonto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EspelhoPontoRepository extends JpaRepository<EspelhoPonto, Long> {

    List<EspelhoPonto> findByFuncionarioIdOrderByAnoDescMesDesc(Long funcionarioId);

    Optional<EspelhoPonto> findByFuncionarioIdAndAnoAndMes(Long funcionarioId, int ano, int mes);

    List<EspelhoPonto> findBySaldoMinutosNotOrderByAnoDescMesDesc(int saldoMinutos);
}
