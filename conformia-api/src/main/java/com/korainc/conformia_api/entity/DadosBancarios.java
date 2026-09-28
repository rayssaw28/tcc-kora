package com.korainc.conformia_api.entity;

import com.korainc.conformia_api.enums.TipoContaBancaria;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "funcionario_dados_bancarios")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DadosBancarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false, unique = true)
    private Funcionario funcionario;

    @Column(nullable = false, length = 120)
    private String banco;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_conta", nullable = false, length = 30)
    private TipoContaBancaria tipoConta;

    @Column(nullable = false, length = 20)
    private String agencia;

    @Column(nullable = false, length = 30)
    private String conta;

    @Column(name = "chave_pix", nullable = false, length = 180)
    private String chavePix;
}
