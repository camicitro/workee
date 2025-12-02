package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.busquedas.UbicacionDTO;
import com.example.demo.dtos.params.ProvinciaRequestDTO;
import com.example.demo.entities.params.Provincia;
import com.example.demo.services.BaseService;

public interface ProvinciaService extends BaseService<Provincia, Long>{
    public List<Provincia> findProvinciaByPaisId(Long idPais);

    public Provincia guardarProvincia(ProvinciaRequestDTO provinciaRequestDTO);

    public Provincia actualizarProvincia(Long id, ProvinciaRequestDTO provinciaRequestDTO);

    public List<Provincia> obtenerProvincias();

    public List<Provincia> obtenerProvinciasActivas();

    public Boolean habilitarProvincia(Long id);

    public List<UbicacionDTO> traerUbicaciones();

    public Boolean deshabilitarProvincia(Long id);

    public List<Provincia> obtenerProvinciasActivasPorPaisId(Long idPais);


}
