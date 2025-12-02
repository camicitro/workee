package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.ModalidadOfertaRequestDTO;
import com.example.demo.entities.params.ModalidadOferta;
import com.example.demo.services.BaseService;

public interface ModalidadOfertaService extends BaseService<ModalidadOferta, Long> {
    ModalidadOferta guardarModalidadOferta(ModalidadOfertaRequestDTO modalidadOfertaDTO);

    ModalidadOferta actualizarModalidadOferta(Long id, ModalidadOfertaRequestDTO modalidadOfertaDTO);

    Boolean habilitarModalidadOferta(Long id);

    List<ModalidadOferta> obtenerModalidadesOfertas();
    
    List<ModalidadOferta> obtenerModalidadesOfertasActivos();

    Boolean deshabilitarModalidadOferta(Long modalidadOfertaId);
}
