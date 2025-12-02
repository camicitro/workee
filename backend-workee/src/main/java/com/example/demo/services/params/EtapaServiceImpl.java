package com.example.demo.services.params;

import java.text.Normalizer;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.EtapaRequestDTO;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.entities.oferta.CodigoEstadoOferta;
import com.example.demo.entities.params.Etapa;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.repositories.params.EtapaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.empresa.EmpresaService;

import jakarta.transaction.Transactional;

@Service
public class EtapaServiceImpl extends BaseServiceImpl<Etapa, Long> implements EtapaService {

    private final EtapaRepository etapaRepository;
    private final EmpresaService empresaService;
    private final OfertaRepository ofertaRepository;

    public EtapaServiceImpl(EtapaRepository etapaRepository, EmpresaService empresaService, OfertaRepository ofertaRepository) {
        super(etapaRepository);
        this.etapaRepository = etapaRepository;
        this.empresaService = empresaService;
        this.ofertaRepository = ofertaRepository;
    }

    @Override
    @Transactional
    public Etapa crearPredeterminada(EtapaRequestDTO etapaDTO) {
        if (yaExisteEtapa(etapaDTO.getNombreEtapa(), null)) {
            throw new EntityAlreadyExistsException("Ya existe una etapa con ese nombre");
        }

        Etapa nuevaEtapa = new Etapa();
        nuevaEtapa.setNombreEtapa(etapaDTO.getNombreEtapa());
        nuevaEtapa.setDescripcionEtapa(etapaDTO.getDescripcionEtapa());
        nuevaEtapa.setEsPredeterminada(true);
        nuevaEtapa.setEmpresa(null);
        nuevaEtapa.setFechaHoraAlta(new Date());

        //Generar código para identificarla
        String codigoEtapa = generarCodigoUnico(etapaDTO.getNombreEtapa());
        nuevaEtapa.setCodigoEtapa(codigoEtapa);
        
        return etapaRepository.save(nuevaEtapa);
    }

    private String generarCodigoUnico(String nombreEtapa){
        String base = normalizar(nombreEtapa);
        String codigoEtapa = base;
        int contador = 1;

        while(etapaRepository.existsByCodigoEtapa(codigoEtapa)){
            codigoEtapa = base + "_" + contador;
            contador++;
        }
        return codigoEtapa;
    }

    private String normalizar(String texto){
        String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return sinAcentos.trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
    }

    @Override
    @Transactional
    public Etapa crearPropia(Long empresaId, EtapaRequestDTO etapaDTO) {
        //cambiar para que verifique solo en las propias 
        boolean existeNombre = etapaRepository.existsByNombreEtapaIgnoreCaseAndEmpresaIdAndEsPredeterminadaFalse(etapaDTO.getNombreEtapa().trim(), empresaId);
        if (existeNombre) {
            throw new EntityAlreadyExistsException("Ya existe una etapa con ese nombre");
        }

        Empresa empresa = empresaService.findById(empresaId);
        Etapa nuevaEtapa = new Etapa();
        nuevaEtapa.setNombreEtapa(etapaDTO.getNombreEtapa());
        nuevaEtapa.setDescripcionEtapa(etapaDTO.getDescripcionEtapa());
        nuevaEtapa.setEsPredeterminada(false);
        nuevaEtapa.setEmpresa(empresa);
        nuevaEtapa.setFechaHoraAlta(new Date());

        //Generar código para identificarla
        String codigoEtapa = generarCodigoUnico(etapaDTO.getNombreEtapa());
        nuevaEtapa.setCodigoEtapa(codigoEtapa);

        return etapaRepository.save(nuevaEtapa);
    }

    @Override
    @Transactional
    public Etapa actualizarEtapa(Long id, EtapaRequestDTO etapaDTO) {
        Etapa etapaOriginal = this.findById(id);

        // Si viene un nombre no vacío, se valida y se setea
        if (etapaDTO.getNombreEtapa() != null && !etapaDTO.getNombreEtapa().isBlank()) {
            // Si el nombre es distinto al actual, valido duplicado
            if (!etapaDTO.getNombreEtapa().equalsIgnoreCase(etapaOriginal.getNombreEtapa()) &&
                    yaExisteEtapa(etapaDTO.getNombreEtapa(), id)) {
                throw new EntityAlreadyExistsException("Ya existe una etapa con ese nombre");
            }
            etapaOriginal.setNombreEtapa(etapaDTO.getNombreEtapa());
        }

        // Si viene una descripción no vacía, se setea
        if (etapaDTO.getDescripcionEtapa() != null && !etapaDTO.getDescripcionEtapa().isBlank()) {
            etapaOriginal.setDescripcionEtapa(etapaDTO.getDescripcionEtapa());
        }

        return etapaRepository.save(etapaOriginal);
    }


    @Override
    @Transactional
    public Boolean habilitarEtapa(Long id) {
        if (id == null) {
            throw new EntityNotValidException("El ID de la etapa no puede ser nulo");
        }

        Etapa etapa = this.findById(id);
        if (etapa.getFechaHoraBaja() == null) {
            throw new EntityNotValidException("La etapa ya está habilitada");
        }

        etapa.setFechaHoraBaja(null);
        etapaRepository.save(etapa);
        return true;
    }
    
    @Override
    public List<Etapa> obtenerEtapas() {
        return etapaRepository.findAllByOrderByNombreEtapaAsc();
    }

    @Override
    public List<Etapa> obtenerEtapasActivos() {
        return etapaRepository.buscarEtapasActivos();
    }

    private Boolean yaExisteEtapa(String nombreEtapa, Long idAExcluir) {
        Optional<Etapa> etapaExiste = etapaRepository.findByNombreEtapaIgnoreCase(nombreEtapa);
        return etapaExiste
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();
    }

    @Override
    @Transactional
    public List<Etapa> findAllByIdIn(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("La colección de IDs no puede ser nula o vacía");
        }
        return etapaRepository.findAllByIdIn(ids);
    }

    @Override
    @Transactional
    public List<Etapa> findDisponiblesParaEmpresa(Long empresaId) {
        if (empresaId == null) {
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }
        return etapaRepository.findDisponiblesParaEmpresa(empresaId);
    }

    //ADMIN: puede deshabilitar cualquier etapa que no esté en uso
    @Override
    @Transactional
    public void deshabilitarEtapa(Long idEtapa){
        if (idEtapa == null) {
            throw new EntityNotValidException("El ID de la etapa no puede ser nulo");
        }
       
        Etapa etapa = this.findById(idEtapa);
        
        boolean enUso = ofertaRepository.existsOfertaNoFinalizadaQueUsaEtapa(idEtapa, CodigoEstadoOferta.FINALIZADA);
        if (enUso) throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");

        etapa.setFechaHoraBaja(new Date());
        etapaRepository.save(etapa);
    }

    // EMPRESA: solo puede eliminar sus etapas propias, no las predeterminadas.    
    @Override
    @Transactional
    public void eliminarEtapaPropia(Long idEtapa, Long empresaId) {

        Etapa etapa = etapaRepository.findByIdAndEmpresaIdAndFechaHoraBajaIsNull(idEtapa, empresaId)
        .orElseThrow(() -> new EntityNotFoundException("No existe la etapa para esa empresa o ya está deshabilitada"));

        if (Boolean.TRUE.equals(etapa.getEsPredeterminada())) {
            throw new IllegalStateException("No se puede eliminar una etapa predeterminada");
        }

        boolean enUso = ofertaRepository.existsOfertaNoFinalizadaQueUsaEtapa(idEtapa, CodigoEstadoOferta.FINALIZADA);
        if (enUso) throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");

        etapa.setFechaHoraBaja(new Date());
        etapaRepository.save(etapa);

    }

    @Override
    public Etapa obtenerEtapaPorCodigo(String codigoEtapa){
        Etapa etapa = etapaRepository.findByCodigoEtapaAndFechaHoraBajaIsNull(codigoEtapa);
        if(etapa == null){
            throw new EntityNotFoundException("No se encontró la etapa buscada");
        }
        return etapa;
    }
    

    @Override
    @Transactional
    public Etapa findOrCreatePredeterminada(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de la etapa no puede ser nulo/vacío");
        }
        return etapaRepository
            .findByCodigoEtapaIgnoreCaseAndEsPredeterminadaAndEmpresaIsNull(nombre, true)
            .orElseGet(() -> {
                Etapa e = new Etapa();
                e.setNombreEtapa(nombre.toUpperCase());
                e.setDescripcionEtapa(nombre);
                e.setEsPredeterminada(true);
                e.setEmpresa(null);
                e.setFechaHoraAlta(new Date());
                return etapaRepository.save(e);
            });
    }

}
