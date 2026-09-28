package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.RequisitoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RequisitoDocumentoRepository extends JpaRepository<RequisitoDocumento, Long> {
    boolean existsByTituloIgnoreCase(String titulo);

    Optional<RequisitoDocumento> findByTituloIgnoreCase(String titulo);

    @Query(value = """
            SELECT id FROM requisito_documento
            WHERE LOWER(titulo) = LOWER(:titulo) AND ativo = false
            """, nativeQuery = true)
    Optional<Long> findIdInativoByTitulo(@Param("titulo") String titulo);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE requisito_documento
            SET ativo = true,
                titulo = :titulo,
                tipo = :tipo,
                descricao = :descricao,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = :id
            """, nativeQuery = true)
    int reativar(
            @Param("id") Long id,
            @Param("titulo") String titulo,
            @Param("tipo") String tipo,
            @Param("descricao") String descricao
    );
}
