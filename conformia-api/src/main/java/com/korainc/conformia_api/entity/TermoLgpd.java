package com.korainc.conformia_api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "termo_lgpd")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TermoLgpd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String versao;

    @Column(nullable = false, length = 500)
    private String url;

    @CreationTimestamp
    @Column(name = "publicado_em", nullable = false, updatable = false)
    private OffsetDateTime publicadoEm;
}
