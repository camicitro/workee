package com.example.demo.controllers.oferta;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.ofertas.CandidatoPostuladoDTO;
import com.example.demo.dtos.ofertas.OfertaRequestDTO;
import com.example.demo.dtos.params.OfertasEmpleadoDTO;
import com.example.demo.dtos.postulaciones.EtapaActualPostulacionDTO;
import com.example.demo.dtos.postulaciones.OfertasEtapasDTO;
import com.example.demo.entities.oferta.CodigoEstadoOferta;
import com.example.demo.entities.oferta.Oferta;
import com.example.demo.entities.params.Etapa;
import com.example.demo.services.BajaOrquestadorService;
import com.example.demo.services.oferta.OfertaService;
import com.example.demo.services.postulaciones.PostulacionOfertaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/ofertas")
@Tag(name = "Oferta", description = "Controlador para operaciones CRUD")
public class OfertaController {

    private final OfertaService ofertaService;
    private final PostulacionOfertaService postulacionOfertaService;
    private final BajaOrquestadorService bajaOrquestadorService;

    public OfertaController(OfertaService ofertaService, PostulacionOfertaService postulacionOfertaService, BajaOrquestadorService bajaOrquestadorService) {
        this.ofertaService = ofertaService;
        this.postulacionOfertaService = postulacionOfertaService;
        this.bajaOrquestadorService = bajaOrquestadorService;
    }
    
    /******* Metodo para crear una nueva Oferta *******/
    //Anotación de swagger para coumentar operación:
    @Operation(summary = "Crear una nueva Oferta") 
    //Este método responde a solicitudes HTTP POST:
    @PostMapping
    //Se verifica que el usuario tenga el permiso necesario:
    @PreAuthorize("hasAuthority('GESTION_OFERTAS')") 
    public ResponseEntity<Oferta> crearOferta(@Valid @RequestBody OfertaRequestDTO ofertaDTO) { 
        //Con @Valid se controla que los datos sean correctos (ver OfertaRequestDTO)
        
        //Llamado al servicio para crear la oferta usando los datos recibidos:
        Oferta nuevaOferta = ofertaService.crearOferta(ofertaDTO);

        //Devuelve una respuesta HTTP con código 201 (CREATED) y el objeto oferta creado:
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaOferta);
    }
   
    @Operation(summary = "Obtener una Oferta por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('BUSCAR_OFERTAS')")
    public ResponseEntity<Oferta> getOfertaById(@PathVariable("id") Long id) {
        Oferta oferta = ofertaService.findById(id);
        return ResponseEntity.ok().body(oferta);
    }

    @Operation(summary = "Cambiar el estado de una Oferta")
    @PostMapping("/{id}/cambiar-estado/{nuevoCodigo}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<Oferta> cambiarEstado(@PathVariable("id") Long id, @PathVariable("nuevoCodigo") String nuevoCodigo) {
        Oferta ofertaActualizada;
        if(nuevoCodigo.equals(CodigoEstadoOferta.FINALIZADA)){
            ofertaActualizada = bajaOrquestadorService.rechazarATodosYFinalizarOferta(id);
        }else {
            ofertaActualizada = ofertaService.cambiarEstado(id, nuevoCodigo);
        }
        return ResponseEntity.ok(ofertaActualizada);
    }

    @Operation(summary = "Marcar el resultado final de una Oferta")
    @PostMapping("/{id}/marcar-resultado-final")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<Oferta> marcarResultadoFinal(@PathVariable("id") Long id, @RequestBody boolean conExito) {
        Oferta ofertaActualizada = ofertaService.marcarResultadoFinal(id, conExito);
        return ResponseEntity.ok(ofertaActualizada);
    }

    @Operation(summary = "Obtener todas las Ofertas de una Empresa")
    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('POSTULAR_OFERTA')")
    public ResponseEntity<List<Oferta>> getOfertasByEmpresaId(@PathVariable Long empresaId) {
        List<Oferta> ofertas = ofertaService.findAllByEmpresaId(empresaId);
        return ResponseEntity.ok().body(ofertas);
    }

    @Operation(summary = "Buscar Etapas de Ofertas Activas por Empleado")
    @GetMapping("/empleado/{empleadoId}/etapas")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<List<OfertasEmpleadoDTO>> getEtapasByEmpleadoId(@PathVariable("empleadoId") Long empleadoId) {
        List<OfertasEmpleadoDTO> etapas = ofertaService.buscarOfertasEmpleado(empleadoId);
        return ResponseEntity.ok().body(etapas);
    }

    @Operation(summary = "Obtener todas las próximas etapas de una oferta")
    @GetMapping("/{idOferta}/{nroEtapa}/etapas")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('POSTULAR_OFERTA') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<?> getProximasEtapas(@PathVariable Long idOferta, @PathVariable Integer nroEtapa) {
        List<OfertasEtapasDTO> proximas = ofertaService.buscarProximasEtapasEnOferta(idOferta, nroEtapa);
        return ResponseEntity.ok().body(proximas);
    }

    @Operation(summary = "Obtener todas las Ofertas ABIERTAS de una Empresa")
    @GetMapping("/empresa/abiertas/{empresaId}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('POSTULAR_OFERTA')")
    public ResponseEntity<List<Oferta>> getOfertasNoFinalizadas(@PathVariable Long empresaId) {
        List<Oferta> ofertas = ofertaService.buscarOfertasAbiertas(empresaId);
        return ResponseEntity.ok().body(ofertas);
    }

    @Operation(summary = "Obtener todas las Ofertas ABIERTAS de una Empresa para enviar a un candidato")
    @GetMapping("/empresa/{empresaId}/enviarACandidato/{candidatoId}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('POSTULAR_OFERTA')")
    public ResponseEntity<List<Oferta>> getOfertasParaEnviar(@PathVariable Long empresaId, @PathVariable Long candidatoId) {
        List<Oferta> ofertas = ofertaService.buscarOfertasAbiertasParaEnviar(empresaId, candidatoId);
        return ResponseEntity.ok().body(ofertas);
    }

    @Operation(summary = "Obtener cantidad total de postulados (en curso)")
    @GetMapping("/{idOferta}/postulados")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') ")
    public ResponseEntity<?> getCantidadPostulados(@PathVariable Long idOferta) {
        Integer cantidad = ofertaService.obtenerCantidadDePostulados(idOferta);
        return ResponseEntity.ok().body(cantidad);
    }

    @Operation(summary = "Obtener las etapas de una oferta (excepto PENDIENTE)")
    @GetMapping("/{idOferta}/etapas")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') ")
    public ResponseEntity<?> getEtapasOferta(@PathVariable Long idOferta) {
        List<Etapa> etapas = ofertaService.obtenerEtapasDeOferta(idOferta);
        return ResponseEntity.ok().body(etapas);
    }

    @Operation(summary = "Traer todos los candidatos postulados (no PENDIENTES)")
    @GetMapping("/{idOferta}/candidatosPostulados")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<?> getCandidatosPostulados(@PathVariable Long idOferta) {
        List<CandidatoPostuladoDTO> candidatos = postulacionOfertaService.traerCandidatosPostuladosAOferta(idOferta);
        return ResponseEntity.ok().body(candidatos);
    }

    @Operation(summary = "Traer los candidatos pendientes que postularon a la oferta")
    @GetMapping("/{idOferta}/candidatosPostuladosPendientes")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<?> getCandidatosPostuladosPendientes(@PathVariable Long idOferta) {
        List<CandidatoPostuladoDTO> candidatos = postulacionOfertaService.traerCandidatosPendientesPostuladosAOferta(idOferta);
        return ResponseEntity.ok().body(candidatos);
    }

    @Operation(summary = "Traer los candidatos seleccionados de la oferta")
    @GetMapping("/{idOferta}/candidatosSeleccionados")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<?> getCandidatosSeleccionados(@PathVariable Long idOferta) {
        List<CandidatoPostuladoDTO> candidatos = postulacionOfertaService.traerCandidatosSeleccionados(idOferta);
        return ResponseEntity.ok().body(candidatos);
    }

    @Operation(summary = "Devuelve etapa actual si el candidato ya estaba postulado a la oferta")
    @GetMapping("/{idOferta}/{idCandidato}")
    //@PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('GESTIONAR_POSTULACION') or hasAuthority('POSTULAR_OFERTA')")
    @PreAuthorize("hasAnyAuthority('GESTION_OFERTAS', 'GESTIONAR_POSTULACION', 'POSTULAR_OFERTA', 'BUSCAR_OFERTAS')")
    public ResponseEntity<?> getEtapaActualCandidato(@PathVariable Long idOferta, @PathVariable Long idCandidato) {
        EtapaActualPostulacionDTO etapaActualPostulacionDTO = postulacionOfertaService.verEtapaActualDeUnaPostulacion(idCandidato, idOferta);
        if(etapaActualPostulacionDTO == null){
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok().body(etapaActualPostulacionDTO.getNombreEtapa());
    }

    @Operation(summary = "Traer los candidatos pendientes a los que la empresa les mando la oferta")
    @GetMapping("/{idOferta}/candidatosEnviados")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<?> getCandidatosEnviados(@PathVariable Long idOferta) {
        List<CandidatoPostuladoDTO> candidatos = postulacionOfertaService.traerCandidatosEnviadaPostulacionAOferta(idOferta);
        return ResponseEntity.ok().body(candidatos);
    }

}
