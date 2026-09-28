package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.TermoLgpd;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TermoLgpdRepository extends JpaRepository<TermoLgpd, Long> {

    Optional<TermoLgpd> findFirstByOrderByPublicadoEmDescIdDesc();

    boolean existsByVersao(String versao);
}
