package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.ClassificacaoSaldo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "espelho_ponto")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE espelho_ponto SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class EspelhoPonto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes;

    private Integer diasUteis;

    @Column(nullable = false)
    private int horasPrevistasMinutos;

    @Column(nullable = false)
    private int horasTrabalhadasMinutos;

    @Column(nullable = false)
    private int saldoMinutos;

    @Column(nullable = false)
    private int horasExtrasMinutos;

    @Column(nullable = false)
    private int horasFaltantesMinutos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClassificacaoSaldo classificacao;

    @Column(length = 120)
    private String origem;
}
