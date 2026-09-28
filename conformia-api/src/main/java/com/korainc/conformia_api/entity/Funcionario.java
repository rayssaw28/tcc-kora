package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.EstadoCivil;
import com.korainc.conformia_api.enums.Genero;
import com.korainc.conformia_api.enums.Perfil;
import com.korainc.conformia_api.enums.StatusAdmissao;
import com.korainc.conformia_api.enums.UfBrasil;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "funcionario")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE funcionario SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class Funcionario extends BaseEntity {

    @Column(nullable = false, length = 180)
    private String nome;

    @Column(nullable = false, length = 11, unique = true)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "data_admissao")
    private LocalDate dataAdmissao;

    @Column(name = "data_desligamento")
    private OffsetDateTime dataDesligamento;

    @Column(name = "motivo_desligamento", length = 255)
    private String motivoDesligamento;

    @Column(name = "desligado_por_id")
    private Long desligadoPorId;

    @Column(name = "desligado_por_nome", length = 180)
    private String desligadoPorNome;

    @lombok.Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "funcionario_nacionalidade",
            joinColumns = @JoinColumn(name = "funcionario_id")
    )
    @Column(name = "pais", nullable = false, length = 100)
    private Set<String> nacionalidades = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "uf_natal", length = 2)
    private UfBrasil ufNatal;

    @Column(name = "cidade_natal", length = 120)
    private String cidadeNatal;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Genero genero;

    @Column(name = "nome_social", length = 180)
    private String nomeSocial;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_civil", length = 30)
    private EstadoCivil estadoCivil;

    @Column(name = "ctps_numero", length = 30)
    private String ctpsNumero;

    @Column(name = "ctps_serie", length = 20)
    private String ctpsSerie;

    @Enumerated(EnumType.STRING)
    @Column(name = "ctps_uf_emissor", length = 2)
    private UfBrasil ctpsUfEmissor;

    @Column(length = 11)
    private String pis;

    @Column(name = "ctps_digital")
    private Boolean ctpsDigital;

    @Column(nullable = false, length = 180, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @lombok.Builder.Default
    @Column(name = "senha_temporaria", nullable = false)
    private boolean senhaTemporaria = false;

    @lombok.Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Perfil perfil = Perfil.FUNCIONARIO;

    @lombok.Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status_admissao", nullable = false, length = 30)
    private StatusAdmissao statusAdmissao = StatusAdmissao.PRE_ADMISSAO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    private Departamento departamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id")
    private Cargo cargo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestor_id")
    private Funcionario gestor;

    @lombok.Builder.Default
    @OneToMany(mappedBy = "gestor", fetch = FetchType.LAZY)
    private List<Funcionario> subordinados = new ArrayList<>();
}
