package com.korainc.conformia_api.repository;

import com.korainc.conformia_api.entity.FormacaoAcademica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormacaoAcademicaRepository extends JpaRepository<FormacaoAcademica, Long> {

    List<FormacaoAcademica> findByFuncionarioIdOrderByAnoConclusaoDescIdDesc(Long funcionarioId);

    void deleteByFuncionarioId(Long funcionarioId);
}
