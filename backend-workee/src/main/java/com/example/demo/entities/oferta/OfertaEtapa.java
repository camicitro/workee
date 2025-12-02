package com.example.demo.entities.oferta;

import com.example.demo.entities.Base;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.params.Etapa;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "oferta_etapa")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OfertaEtapa extends Base {
    
    @NotNull
    @Column(name = "numero_etapa", nullable = false)
    private Integer numeroEtapa;

    //Descripcion de la Etapa asociada a esta OfertaEtapa.
    @Column(name = "descripcion_oferta_etapa", columnDefinition = "TEXT")
    private String descripcionAdicional;

    //Hace referencia a si el Candidato adjunta enlace en esa etapa.
    @NotNull
    @Column(name = "adjunta_enlace")
    private Boolean adjuntaEnlace;

    @ManyToOne
    @JoinColumn(name = "id_etapa", nullable = false)
    @NotNull
    private Etapa etapa;

    @ManyToOne
    @JoinColumn(name = "id_empleado_empresa", nullable = true)
    private EmpleadoEmpresa empleadoEmpresa;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_archivo_adjunto", nullable = true)
    private ArchivoAdjunto archivoAdjunto;
}
