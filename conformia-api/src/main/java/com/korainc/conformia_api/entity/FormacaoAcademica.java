package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.Escolaridade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "funcionario_formacao_academica")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormacaoAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Escolaridade escolaridade;

    @Column(name = "instituicao_ensino", nullable = false, length = 180)
    private String instituicaoEnsino;

    @Column(nullable = false, length = 180)
    private String curso;

    @Column(name = "ano_conclusao", nullable = false)
    private Integer anoConclusao;
}
