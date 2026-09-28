package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Atestado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.korainc.conformia_api.enums.StatusDocumento;

public interface AtestadoRepository extends JpaRepository<Atestado, Long> {

    List<Atestado> findByFuncionarioIdOrderByDataInicioDesc(Long funcionarioId);

    List<Atestado> findByStatusOrderByCriadoEmDesc(StatusDocumento status);
}
