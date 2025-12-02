package com.example.demo.dtos.params;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfertasEmpleadoDTO {
    
    private Long ofertaId;

    private String titulo;
    
    private String descripcion;
    
    private String estadoOferta;    // "ABIERTA" o "CERRADA"
    
    List<String> nombresEtapas;
}
