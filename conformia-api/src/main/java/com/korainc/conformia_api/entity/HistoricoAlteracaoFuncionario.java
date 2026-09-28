package com.korainc.conformia_api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "funcionario_historico")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoAlteracaoFuncionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "alterado_por_id", nullable = false)
    private Long alteradoPorId;

    @Column(name = "alterado_por_nome", nullable = false, length = 180)
    private String alteradoPorNome;

    @Column(nullable = false, length = 60)
    private String campo;

    @Column(name = "valor_anterior", length = 1000)
    private String valorAnterior;

    @Column(name = "valor_novo", length = 1000)
    private String valorNovo;

    @CreationTimestamp
    @Column(name = "alterado_em", nullable = false, updatable = false)
    private OffsetDateTime alteradoEm;
}
