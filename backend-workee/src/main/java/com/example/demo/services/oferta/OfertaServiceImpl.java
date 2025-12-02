package com.example.demo.services.oferta;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.busquedas.FiltrosOfertaRequestDTO;
import com.example.demo.dtos.ofertas.OfertaRequestDTO;
import com.example.demo.dtos.params.OfertasEmpleadoDTO;
import com.example.demo.dtos.postulaciones.OfertasEtapasDTO;
import com.example.demo.entities.Base;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.entities.oferta.CodigoEstadoOferta;
import com.example.demo.entities.oferta.FechaFiltroOfertaEnum;
import com.example.demo.entities.oferta.Oferta;
import com.example.demo.entities.oferta.OfertaEstadoOferta;
import com.example.demo.entities.oferta.OfertaEtapa;
import com.example.demo.entities.oferta.OfertaHabilidad;
import com.example.demo.entities.params.CodigoEtapa;
import com.example.demo.entities.params.Etapa;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.entities.params.ModalidadOferta;
import com.example.demo.entities.params.TipoContratoOferta;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.mappers.OfertaMapper;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.empresa.EmpresaService;
import com.example.demo.services.params.HabilidadService;
import com.example.demo.services.params.ModalidadOfertaService;
import com.example.demo.services.params.TipoContratoOfertaService;

@Service
public class OfertaServiceImpl extends BaseServiceImpl<Oferta, Long> implements OfertaService {

    private final OfertaRepository ofertaRepository;
    private final OfertaMapper ofertaMapper;
    private final EmpresaService empresaService;
    private final ModalidadOfertaService modalidadOfertaService;
    private final TipoContratoOfertaService tipoContratoOfertaService;
    private final OfertaEstadoOfertaService ofertaEstadoOfertaService;
    private final HabilidadService habilidadService;
    private final OfertaEtapaService ofertaEtapaService;

    public OfertaServiceImpl(OfertaRepository ofertaRepository, OfertaMapper ofertaMapper, EmpresaService empresaService, ModalidadOfertaService modalidadOfertaService, TipoContratoOfertaService tipoContratoOfertaService, OfertaEstadoOfertaService ofertaEstadoOfertaService, HabilidadService habilidadService, OfertaEtapaService ofertaEtapaService) {
        super(ofertaRepository);
        this.ofertaRepository = ofertaRepository;
        this.ofertaMapper = ofertaMapper;
        this.empresaService = empresaService;
        this.modalidadOfertaService = modalidadOfertaService;
        this.tipoContratoOfertaService = tipoContratoOfertaService;
        this.ofertaEstadoOfertaService = ofertaEstadoOfertaService;
        this.habilidadService = habilidadService; 
        this.ofertaEtapaService = ofertaEtapaService;
    }

    @Override //Indica que este método implementa el método definido en OfertaService
    @Transactional //Asegura que todas las operaciones dentro del método se ejecuten 
                   // en una misma transacción. Si algo falla, se hace rollback de todo
                   // (se deshacen los cambios)
    public Oferta crearOferta(OfertaRequestDTO ofertaDTO) {
        //Validación inicial: no se puede crear una oferta sin recibir el DTO
        if(ofertaDTO == null) {
            throw new IllegalArgumentException("El objeto ofertaDTO no puede ser nulo");
        }
        
        //Mapeo de campos simples del DTO a la entidad Oferta
        Oferta oferta = ofertaMapper.toEntity(ofertaDTO);

        //Setear las relaciones con empresa, modalidad oferta y tipo de contrato
        Empresa empresa = empresaService.findById(ofertaDTO.getIdEmpresa());
        ModalidadOferta modalidadOferta = modalidadOfertaService.findById(ofertaDTO.getIdModalidadOferta());
        TipoContratoOferta tipoContratoOferta = tipoContratoOfertaService.findById(ofertaDTO.getIdTipoContratoOferta());
        oferta.setEmpresa(empresa);
        oferta.setModalidadOferta(modalidadOferta);
        oferta.setTipoContratoOferta(tipoContratoOferta);

        //Inicializar estado de la oferta como "Abierta"
        OfertaEstadoOferta estadoInicial = ofertaEstadoOfertaService.abrirOferta();
        if (oferta.getEstadosOferta() == null) {
            oferta.setEstadosOferta(new ArrayList<>());
        }
        oferta.getEstadosOferta().add(estadoInicial);

        //Asociar habilidades si el DTO contiene IDs de habilidades
        if (ofertaDTO.getIdHabilidades() != null && !ofertaDTO.getIdHabilidades().isEmpty()) {
            //Traer habilidades desde la BD según los IDs recibidos
            List<Habilidad> habilidadesDB = habilidadService.findAllById(ofertaDTO.getIdHabilidades());
            
            //Eliminar IDs duplicados para evitar repetición de habilidades
            List<Long> idsDistintos = ofertaDTO.getIdHabilidades().stream()
                                                .distinct()
                                                .collect(Collectors.toList());
            
            //Mapeo rápido de habilidad (id -> habilidad)
            Map<Long, Habilidad> porId = habilidadesDB.stream()
                .collect(Collectors.toMap(Habilidad::getId, Function.identity()));

            //Construcción de la lista de OfertaHabilidad 
            List<OfertaHabilidad> habilidades = new ArrayList<>();
            for (Long idHab : idsDistintos) {
                Habilidad hab = porId.get(idHab); 
                OfertaHabilidad oh = new OfertaHabilidad();
                oh.setFechaHoraAlta(new Date());
                oh.setHabilidad(hab);
                habilidades.add(oh);
            }
            
            //Asignar las habilidades a la oferta
            if (oferta.getHabilidades() == null) {
                oferta.setHabilidades(new ArrayList<>());
            }
            oferta.getHabilidades().addAll(habilidades);
        }
        
        //Configurar etapas del proceso de selección
        oferta.setOfertaEtapas(new ArrayList<>());
        int orden = 1;
        
        // Etapa inicial: PENDIENTE
        oferta.getOfertaEtapas().add(ofertaEtapaService.crearEtapaPredeterminada(CodigoEtapa.PENDIENTE, orden++));

        // Etapas intermedias personalizadas (seleccionadas por el usuario)
        if (ofertaDTO.getOfertaEtapas() != null && !ofertaDTO.getOfertaEtapas().isEmpty()) {
            List<OfertaEtapa> intermedias = ofertaEtapaService.crearOfertaEtapasDesdeDto(
                empresa.getId(), 
                ofertaDTO.getOfertaEtapas()
            );
            for (OfertaEtapa oe : intermedias) {
                oe.setNumeroEtapa(orden++);
            }
            oferta.getOfertaEtapas().addAll(intermedias);
        }
        
        // 3) Etapa RECHAZADO
        oferta.getOfertaEtapas().add(ofertaEtapaService.crearEtapaPredeterminada(CodigoEtapa.RECHAZADO, orden++));

        // 4) Etapa SELECCIONADO
        oferta.getOfertaEtapas().add(ofertaEtapaService.crearEtapaPredeterminada(CodigoEtapa.SELECCIONADO, orden++));
        
        //Métodos de creación
        oferta.setFechaHoraAlta(new Date());
        oferta.setFinalizadaConExito(null); 
        oferta.setFechaFinalizacion(null); 

        //Guardado de la oferta en la base de datos y devolverla
        return ofertaRepository.save(oferta); 
    }

    @Override
    @Transactional
    public Oferta cambiarEstado(Long ofertaId, String nuevoCodigo) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
            .orElseThrow(() -> new EntityNotFoundException("Oferta no encontrada con ID: " + ofertaId));
        
        OfertaEstadoOferta estadoActual = oferta.getEstadosOferta()
            .stream()
            .filter(estado -> estado.getFechaHoraBaja() == null) // Filtrar estados activos
            .max(Comparator.comparing(Base::getFechaHoraAlta))
            .orElse(null);

    // 1) Si ya está FINALIZADA, no permito transiciones
        if (estadoActual != null 
                && CodigoEstadoOferta.FINALIZADA.equals(estadoActual.getEstadoOferta().getCodigo())) {
            throw new IllegalStateException("La oferta ya está FINALIZADA y no puede cambiar de estado.");
        }
    // 2) Si el estado actual es igual al nuevo, no hago nada
        if (estadoActual != null 
                && Objects.equals(estadoActual.getEstadoOferta().getCodigo(), nuevoCodigo)) {
            return oferta; 
        }

        OfertaEstadoOferta nuevoEstado;
        switch (nuevoCodigo) {
            case CodigoEstadoOferta.ABIERTA -> {
                nuevoEstado = ofertaEstadoOfertaService.abrirOferta();
            }
            case CodigoEstadoOferta.CERRADA -> {
                nuevoEstado = ofertaEstadoOfertaService.cerrarOferta();
            }
            case CodigoEstadoOferta.FINALIZADA -> {
                nuevoEstado = ofertaEstadoOfertaService.finalizarOferta();
                oferta.setFechaFinalizacion(new Date());
            }
            default -> throw new IllegalArgumentException("Código de estado inválido: " + nuevoCodigo);
        }

        if (estadoActual != null) {
            estadoActual.setFechaHoraBaja(new Date());
        }

        if (oferta.getEstadosOferta() == null) {
            oferta.setEstadosOferta(new ArrayList<>());
        }
        oferta.getEstadosOferta().add(nuevoEstado);

        return ofertaRepository.save(oferta);
    }

    @Override
    @Transactional
    public Oferta marcarResultadoFinal(Long ofertaId, boolean conExito) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
            .orElseThrow(() -> new EntityNotFoundException("Oferta no encontrada con ID: " + ofertaId));

        // Debe estar FINALIZADA para poder marcar resultado
        OfertaEstadoOferta estadoActual = oferta.getEstadosOferta().stream()
            .filter(e -> e.getFechaHoraBaja() == null)
            .max(Comparator.comparing(Base::getFechaHoraAlta))
            .orElse(null);

        if (estadoActual == null 
            || !CodigoEstadoOferta.FINALIZADA.equals(estadoActual.getEstadoOferta().getCodigo())) {
            throw new IllegalStateException("Solo se puede marcar resultado cuando la oferta está FINALIZADA.");
        }

        oferta.setFinalizadaConExito(conExito);
        return ofertaRepository.save(oferta);
    }

    @Override
    @Transactional
    public List<Oferta> findAllByEmpresaId(Long empresaId) {
        if (empresaId == null) {
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }
        return ofertaRepository.findAllByEmpresa_IdAndFechaHoraBajaIsNull(empresaId);
    }

    @Override
    public List<Oferta> buscarOfertasSegunFiltros(FiltrosOfertaRequestDTO filtrosOfertaRequestDTO){
        LocalDateTime fechaDesde = calcularFechaDesde(filtrosOfertaRequestDTO.getFechaFiltro());
        System.out.println("fechaDesde " + fechaDesde);
        return ofertaRepository.buscarOfertasSegunFiltros(filtrosOfertaRequestDTO.getNombreOferta(), filtrosOfertaRequestDTO.getIdsProvincias(), filtrosOfertaRequestDTO.getIdsTipoContrato(), filtrosOfertaRequestDTO.getIdsModalidadOferta(), fechaDesde);
    }

    @Override
    public List<Oferta> buscarOfertasPorNombre(String nombreOferta){
        return ofertaRepository.buscarOfertasPorNombre(nombreOferta);
    }

    private LocalDateTime calcularFechaDesde(FechaFiltroOfertaEnum fechaFiltroOfertaEnum){
        if(fechaFiltroOfertaEnum == null){
            return null;
        }
        return switch (fechaFiltroOfertaEnum) {
            case HORAS_24 -> LocalDateTime.now().minusHours(24);
            case DIAS_7 -> LocalDateTime.now().minusDays(7).truncatedTo(ChronoUnit.SECONDS);
            case MES_1 -> LocalDateTime.now().minusMonths(1);
        };
    }

    @Override
    @Transactional
    public List<OfertasEmpleadoDTO> buscarOfertasEmpleado(Long empleadoId) {
        if (empleadoId == null) {
            throw new IllegalArgumentException("El ID del empleado no puede ser nulo");
        }

        List<String> codigos = List.of(CodigoEstadoOferta.ABIERTA, CodigoEstadoOferta.CERRADA);
        List<Object[]> rows = ofertaRepository.findOfertasEmpleado(empleadoId, codigos);

        Map<Long, OfertasEmpleadoDTO> porOferta = new LinkedHashMap<>();
        for (Object[] r : rows) {
            Long   ofertaId     = (Long)   r[0];
            String titulo       = (String) r[1];
            String descripcion  = (String) r[2];
            String estadoCodigo = (String) r[3];
            String nombreEtapa  = (String) r[4];

            OfertasEmpleadoDTO dto = porOferta.get(ofertaId);
            if (dto == null) {
                dto = new OfertasEmpleadoDTO(ofertaId, titulo, descripcion, estadoCodigo, new ArrayList<>());
                porOferta.put(ofertaId, dto);
            }
            if (nombreEtapa != null && !dto.getNombresEtapas().contains(nombreEtapa)) {
                dto.getNombresEtapas().add(nombreEtapa);
            }
        }
        porOferta.values().forEach(d -> d.getNombresEtapas().sort(String::compareToIgnoreCase));
        return new ArrayList<>(porOferta.values());
    }
    

    @Override
    public List<OfertasEtapasDTO> buscarProximasEtapasEnOferta(Long idOferta, Integer nroEtapa){
        return ofertaRepository.buscarProximasEtapasDeOferta(idOferta, nroEtapa);
    }

    @Override
    public List<Oferta> buscarOfertasAbiertas(Long idEmpresa) {
        if (idEmpresa == null) {
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }
        return ofertaRepository.buscarOfertasAbiertas(idEmpresa);
    }

    @Override
    public List<Oferta> buscarOfertasAbiertasParaEnviar(Long idEmpresa, Long candidatoId) {
        if (idEmpresa == null || candidatoId == null) {
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }
        return ofertaRepository.buscarOfertasAbiertasParaCandidato(idEmpresa, candidatoId);
    }

    @Override
    public Integer obtenerCantidadDePostulados(Long idOferta){
        return ofertaRepository.obtenerCantidadDeCandidatosPostulados(idOferta);
    }

    @Override
    public List<Etapa> obtenerEtapasDeOferta(Long idOferta){
        return ofertaRepository.traerEtapasDeUnaOferta(idOferta);
    }
}
