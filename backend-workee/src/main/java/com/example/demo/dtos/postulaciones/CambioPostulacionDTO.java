package com.example.demo.dtos.postulaciones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CambioPostulacionDTO {
    private String codigoEtapaActual;
    private String codigoEtapaNueva;
    private String retroalimentacion;
}
