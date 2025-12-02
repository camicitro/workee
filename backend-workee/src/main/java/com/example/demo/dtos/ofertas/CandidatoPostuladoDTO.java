package com.example.demo.dtos.ofertas;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CandidatoPostuladoDTO {
    private Long idPostulacion;
    private Long idCandidato;
    private String nombreCandidato;
    private String apellidoCandidato;
    private Date fechaHoraPostulacion;
    private String codigoEtapa;
    private String nombreEtapa;
    private String urlFotoPerfil;
}
