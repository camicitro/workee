package com.example.demo.entities.empresa;

import com.example.demo.entities.Base;
import com.example.demo.entities.params.Provincia;
import com.example.demo.entities.params.Rubro;
import com.example.demo.entities.seguridad.Usuario;

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
@Table(name = "empresa")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Empresa extends Base{
 
    @NotNull
    @Column(name = "nombre_empresa")
    private String nombreEmpresa;

    @NotNull
    @Column(name = "descripcion_empresa", columnDefinition = "TEXT")
    private String descripcionEmpresa;

    @NotNull
    @Column(name = "numero_identificacion_fiscal")
    private String numeroIdentificacionFiscal;

    @NotNull
    @Column(name = "telefono_empresa", length = 20)
    private String telefonoEmpresa;

    @NotNull
    @Column(name = "direccion_empresa")
    private String direccionEmpresa;

    @NotNull
    @Column(name = "sitio_web_empresa")
    private String sitioWebEmpresa;

    @ManyToOne()
    @JoinColumn(name = "id_provincia")
    @NotNull
    private Provincia provincia;

    @ManyToOne()
    @JoinColumn(name = "id_rubro")
    @NotNull
    private Rubro rubro;

    @OneToOne() 
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @NotNull
    @Column(name = "url_documento_legal")
    private String urlDocumentoLegal;
}
