package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CargoRepository extends JpaRepository<Cargo, Long> {

    Optional<Cargo> findByNome(String nome);

    boolean existsByNome(String nome);

    @Query(value = """
            SELECT id FROM cargo
            WHERE nome = :nome AND ativo = false
            """, nativeQuery = true)
    Optional<Long> findIdInativoByNome(@Param("nome") String nome);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE cargo
            SET ativo = true,
                descricao = :descricao,
                departamento_id = :departamentoId,
                lider_direto_id = :liderDiretoId,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = :id
            """, nativeQuery = true)
    int reativar(
            @Param("id") Long id,
            @Param("descricao") String descricao,
            @Param("departamentoId") Long departamentoId,
            @Param("liderDiretoId") Long liderDiretoId
    );
}
