package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.ConsentimentoLgpd;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentimentoLgpdRepository extends JpaRepository<ConsentimentoLgpd, Long> {

    List<ConsentimentoLgpd> findByFuncionarioIdOrderByRegistradoEmDesc(Long funcionarioId);

    Optional<ConsentimentoLgpd> findFirstByFuncionarioIdAndVersaoTermoAndUrlTermoAndAceitoTrueOrderByRegistradoEmDesc(
            Long funcionarioId,
            String versaoTermo,
            String urlTermo
    );
}
