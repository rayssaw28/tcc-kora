package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentimentoLgpdRepository extends JpaRepository<ConsentimentoLgpd, Long> {

    List<ConsentimentoLgpd> findByFuncionarioIdOrderByRegistradoEmDescIdDesc(Long funcionarioId);

    /** Último registro do log (aceite ou revogação) do funcionário: define o estado atual. */
    Optional<ConsentimentoLgpd> findFirstByFuncionarioIdOrderByRegistradoEmDescIdDesc(Long funcionarioId);
}
