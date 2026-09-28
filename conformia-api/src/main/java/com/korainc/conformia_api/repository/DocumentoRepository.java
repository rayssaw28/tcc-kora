package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Documento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.korainc.conformia_api.enums.StatusDocumento;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    List<Documento> findByFuncionarioId(Long funcionarioId);

    boolean existsByFuncionarioIdAndRequisitoId(Long funcionarioId, Long requisitoId);

    boolean existsByFuncionarioIdAndRequisitoIdAndStatus(
            Long funcionarioId,
            Long requisitoId,
            StatusDocumento status
    );
}
