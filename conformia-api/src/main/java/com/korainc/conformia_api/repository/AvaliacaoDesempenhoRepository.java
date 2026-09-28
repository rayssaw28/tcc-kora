package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.AvaliacaoDesempenho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoDesempenhoRepository extends JpaRepository<AvaliacaoDesempenho, Long> {

    List<AvaliacaoDesempenho> findByAvaliadoIdOrderByCriadoEmDesc(Long avaliadoId);

    List<AvaliacaoDesempenho> findByAvaliadorIdOrderByCriadoEmDesc(Long avaliadorId);
}
