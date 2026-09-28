package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.StatusDocumento;
import com.korainc.conformia_api.enums.TipoDocumento;
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
@Table(name = "documento")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE documento SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class Documento extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TipoDocumento tipo;

    @Column(name = "titulo_personalizado", length = 120)
    private String tituloPersonalizado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisito_id")
    private RequisitoDocumento requisito;

    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @Column(nullable = false, length = 512)
    private String caminho;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;

    @lombok.Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDocumento status = StatusDocumento.PENDENTE;

    @Column(name = "motivo_reprovacao", length = 255)
    private String motivoReprovacao;
}
