package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

    Optional<Departamento> findByNome(String nome);

    boolean existsByNome(String nome);

    @Query(value = """
            SELECT id FROM departamento
            WHERE nome = :nome AND ativo = false
            """, nativeQuery = true)
    Optional<Long> findIdInativoByNome(@Param("nome") String nome);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE departamento
            SET ativo = true,
                descricao = :descricao,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = :id
            """, nativeQuery = true)
    int reativar(
            @Param("id") Long id,
            @Param("descricao") String descricao
    );
}
