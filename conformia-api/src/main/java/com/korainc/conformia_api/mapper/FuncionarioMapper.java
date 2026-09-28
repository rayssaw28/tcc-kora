package com.korainc.conformia_api.mapper;

import com.korainc.conformia_api.dto.FuncionarioResponse;
import com.korainc.conformia_api.dto.FuncionarioResumo;
import com.korainc.conformia_api.entity.Cargo;
import com.korainc.conformia_api.entity.Departamento;
import com.korainc.conformia_api.entity.Funcionario;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;

@Component
public class FuncionarioMapper {

    public FuncionarioResumo toResumo(Funcionario funcionario) {
        return new FuncionarioResumo(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getEmail(),
                funcionario.getPerfil()
        );
    }

    public FuncionarioResponse toResponse(Funcionario f) {
        Departamento dep = f.getDepartamento();
        Cargo cargo = f.getCargo();
        Funcionario gestor = f.getGestor();

        return new FuncionarioResponse(
                f.getId(),
                f.getNome(),
                f.getCpf(),
                f.getEmail(),
                f.getPerfil(),
                f.getStatusAdmissao(),
                f.getTelefone(),
                f.getDataNascimento(),
                f.getDataAdmissao(),
                f.getDataDesligamento(),
                f.getMotivoDesligamento(),
                f.getDesligadoPorId(),
                f.getDesligadoPorNome(),
                new LinkedHashSet<>(f.getNacionalidades()),
                f.getUfNatal(),
                f.getCidadeNatal(),
                f.getGenero(),
                f.getNomeSocial(),
                f.getEstadoCivil(),
                f.isAtivo(),
                dep != null ? dep.getId() : null,
                dep != null ? dep.getNome() : null,
                cargo != null ? cargo.getId() : null,
                cargo != null ? cargo.getNome() : null,
                gestor != null ? gestor.getId() : null,
                gestor != null ? gestor.getNome() : null,
                f.getCriadoEm(),
                f.getAtualizadoEm()
        );
    }
}
