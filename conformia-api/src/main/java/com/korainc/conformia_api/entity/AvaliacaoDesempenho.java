package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.StatusAvaliacao;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
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

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "avaliacao_desempenho")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE avaliacao_desempenho SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class AvaliacaoDesempenho extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avaliado_id", nullable = false)
    private Funcionario avaliado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avaliador_id", nullable = false)
    private Funcionario avaliador;

    @Column(nullable = false, length = 20)
    private String periodo;

    @Column(name = "comentario_geral", length = 1000)
    private String comentarioGeral;

    @Column(name = "nota_final")
    private Double notaFinal;

    @lombok.Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAvaliacao status = StatusAvaliacao.RASCUNHO;

    @lombok.Builder.Default
    @OneToMany(mappedBy = "avaliacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvaliacaoItem> itens = new ArrayList<>();
}
