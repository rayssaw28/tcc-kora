package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.Funcionario;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    Optional<Funcionario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    List<Funcionario> findByGestorId(Long gestorId);

    List<Funcionario> findByCargoId(Long cargoId);

    List<Funcionario> findByPerfilNot(Perfil perfil);

    List<Funcionario> findByStatusAdmissao(StatusAdmissao statusAdmissao);

    @Query("""
            select f from Funcionario f
            left join fetch f.cargo
            left join fetch f.departamento
            where f.perfil <> com.korainc.conformia_api.enums.Perfil.ADMIN
            """)
    List<Funcionario> findAllParaOrganograma();

    @Query(value = """
            SELECT *
            FROM funcionario
            WHERE ativo = false
              AND status_admissao = 'DESLIGADO'
              AND perfil <> 'ADMIN'
            ORDER BY data_desligamento DESC, nome ASC
            """, nativeQuery = true)
    List<Funcionario> findDesligados();

    @Query(value = """
            SELECT *
            FROM funcionario
            WHERE id = :id
              AND ativo = false
              AND status_admissao = 'DESLIGADO'
            """, nativeQuery = true)
    Optional<Funcionario> findDesligadoById(@Param("id") Long id);

    @Query(value = """
            SELECT *
            FROM funcionario
            WHERE id = :id
            """, nativeQuery = true)
    Optional<Funcionario> findByIdIncluindoInativos(@Param("id") Long id);
}
