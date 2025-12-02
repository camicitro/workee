import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OfertaService } from '../../../oferta/oferta.service';
import { Oferta } from '../../../oferta/oferta';
import { EstadoOfertaService } from './../../../../admin/ABMEstadoOferta/estado-oferta.service';
import { EstadoOferta } from './../../../../admin/ABMEstadoOferta/estado-oferta';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CandidatoPostuladoDTO } from './candidato-postulado-dto';
import { PostulacionService } from '../../../postulaciones/postulacion.service';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { SpinnerComponent } from '../../../../compartidos/spinner/spinner/spinner.component';

type OpcionEtapa = { code: string; name: string };

@Component({
  selector: 'app-detalle-oferta-propia',
  imports: [DatePipe, CommonModule, RouterModule, FormsModule, MultiSelect, SpinnerComponent],
  templateUrl: './detalle-oferta-propia.component.html',
  styleUrl: './detalle-oferta-propia.component.css'
})
export class DetalleOfertaPropiaComponent implements OnInit {
  id?: number;
  oferta?: Oferta;
  estadoActual?: EstadoOferta;
  estadosDisponibles: EstadoOferta[] = [];
  
  filtrosEtapas: OpcionEtapa[] = [];
  filtrosSeleccionadosEtapas: string[] = [];

  selectedTab: string = 'proceso';
  // selectedTabSeleccionados: string = 'seleccionados';
  
  pendientes: CandidatoPostuladoDTO[] = [];
  pendientesFiltrados: CandidatoPostuladoDTO[] = [];
  filtroPendientes: string = '';
  
  postulados: CandidatoPostuladoDTO[] = [];
  postuladosFiltrados: CandidatoPostuladoDTO[] = [];
  filtroPostulados: string = '';
  
  seleccionados: CandidatoPostuladoDTO[] = [];


  enviados: CandidatoPostuladoDTO[] = [];
  // selectedTabEnviados: string = '';

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private ofertaService: OfertaService,
    private estadoOfertaService: EstadoOfertaService,
    private router: Router,
    private postulacionService: PostulacionService
  ) {}

  ngOnInit() {

    this.isLoading = true;
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.route.queryParams.subscribe(params => {
      const tabParam = params['tab'];
      if (tabParam) {
        this.selectedTab = tabParam;
      }
    });
    
    this.cargarOferta();
    this.cargarEstados();

    this.ofertaService.getPendientesPorOferta(this.id).subscribe(data => {
      // console.log(data);
      this.pendientes = data;
      this.pendientesFiltrados = [...this.pendientes];
    });

    this.ofertaService.getPostuladosPorOferta(this.id).subscribe(data => {
      // console.log(data);
      this.postulados = data;
      this.postuladosFiltrados = [...this.postulados];
      this.cargarOpcionesEtapas();
    });

    this.ofertaService.getSeleccionadosPorOferta(this.id).subscribe(data => {
      // console.log(data);
      this.seleccionados = data;
    });

    this.ofertaService.getEnviadosPorOferta(this.id).subscribe(data => {
      // console.log(data);
      this.enviados = data;
    });
  }

  private cargarOferta() {

    this.isLoading = true;
    this.ofertaService.getOferta(this.id!).subscribe(data => {
      this.oferta = data;
      console.log("data: ", data);

      const vigente = this.oferta.estadosOferta.find(
        (e: any) => e.fechaHoraBaja === null
      );

      if (vigente) {
        const codigo = vigente.estadoOferta.codigo;
        const nombre = vigente.estadoOferta.nombreEstadoOferta;
        console.log(nombre)
        const validos = ["ABIERTA", "CERRADA", "FINALIZADA"];

        if (validos.includes(codigo)) {
          this.estadoActual = {
            ...vigente.estadoOferta,
            codigo: codigo,
            nombreEstadoOferta: nombre
          };

        if (!this.route.snapshot.queryParamMap.get('tab')) {
          if (this.estadoActual?.codigo === 'FINALIZADA') {
            this.selectedTab = 'seleccionados';
          } else {
            this.selectedTab = 'proceso';
          }
        }

        } else {
          this.estadoActual = undefined;
        }
      }
      this.isLoading = false;
    });
  }

  private cargarEstados() {
    this.estadoOfertaService.findAllActivos().subscribe(data => {
      this.estadosDisponibles = data;
    });
  }

  cargarOpcionesEtapas(): void {
    const mapa = new Map<string, string>();

    for (const p of this.postulados) {
      const code = (p.nombreEtapa ?? '').toUpperCase();
      const name = p.nombreEtapa ?? '';
      if (code && name && !mapa.has(code)) {
        mapa.set(code, name);
      }
    }

    this.filtrosEtapas = Array.from(mapa.entries()).map(([code, name]) => ({ code, name }));
  }

  cambiarEstadoOferta(codigoNuevoEstado: string) {
    let configSwal: any;

    if (codigoNuevoEstado === "CERRADA") {
      configSwal = {
        title: "¿Está seguro de que desea cerrar la oferta?",
        text: "No podrá recibir más postulaciones",
        icon: "info",
        iconColor: "#31A5DD",
        showCancelButton: true,
        confirmButtonColor: "#31A5DD",
        cancelButtonColor: "#697077",
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "No, volver",
        reverseButtons: true,
      };
    } else if (codigoNuevoEstado === "FINALIZADA") {
      configSwal = {
        title: "¿Está seguro de que desea finalizar la oferta?",
        text: "Se finalizará el proceso de selección.\nLos candidatos restantes serán notificados",
        icon: "warning",
        iconColor: "#31A5DD",
        showCancelButton: true,
        confirmButtonColor: "#31A5DD",
        cancelButtonColor: "#697077",
        confirmButtonText: "Sí, finalizar",
        cancelButtonText: "No, volver",
        reverseButtons: true,
      };
    } else if (codigoNuevoEstado === "ABIERTA") {
      configSwal = {
        title: "¿Está seguro de que desea reabrir la oferta?",
        text: "La oferta volverá a estar disponible y podrá recibir postulaciones.",
        icon: "question",
        iconColor: "#31A5DD",
        showCancelButton: true,
        confirmButtonColor: "#31A5DD",
        cancelButtonColor: "#697077",
        confirmButtonText: "Sí, reabrir",
        cancelButtonText: "No, volver",
        reverseButtons: true,
      };
    } else {
      configSwal = {
        title: "¿Desea cambiar el estado de la oferta?",
        text: "Esta acción no se puede deshacer.",
        icon: "question",
        iconColor: "#31A5DD",
        showCancelButton: true,
        confirmButtonColor: "#31A5DD",
        cancelButtonColor: "#697077",
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "No, volver",
        reverseButtons: true,
      };
    }

    Swal.fire(configSwal).then((result) => {
      if (result.isConfirmed) {
        this.ofertaService.cambiarEstadoOferta(this.id!, codigoNuevoEstado).subscribe({
          next: () => {
            this.estadoActual = this.estadosDisponibles.find(e => e.codigo === codigoNuevoEstado);
            
            if (this.estadoActual?.codigo === "FINALIZADA") {
              this.selectedTab = "seleccionados";
              this.selectedTab = "";

              this.postulados = [];
              this.postuladosFiltrados = [];
              this.pendientes = [];
              this.pendientesFiltrados = [];
            }

            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "El estado de la oferta se actualizó correctamente",
              timer: 3000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al actualizar estado de oferta', error);
            if (error.error.message?.includes("La oferta ya está FINALIZADA")) {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "La oferta ya finalizó, no puede cambiar su estado",
                timer: 3000,
                showConfirmButton: false,
              });
            }
          },
        });
      }
    });
  }

  buscarPendientes() {
    const term = this.filtroPendientes.toLowerCase().trim();

    if (term === '') {
      this.pendientesFiltrados = [...this.pendientes];
    } else {
      this.pendientesFiltrados = this.pendientes.filter(p =>
        `${p.nombreCandidato} ${p.apellidoCandidato}`
          .toLowerCase()
          .includes(term)
      );
    }
  }

  buscarPostulados() {
    const term = this.filtroPostulados.toLowerCase().trim();

    this.postuladosFiltrados = this.postulados.filter(p => {
      const coincideTexto = term === '' || 
        `${p.nombreCandidato} ${p.apellidoCandidato}`.toLowerCase().includes(term);

      const coincideEtapa = 
        this.filtrosSeleccionadosEtapas.length === 0 || 
        this.filtrosSeleccionadosEtapas.includes((p.nombreEtapa ?? '').toUpperCase());

      return coincideTexto && coincideEtapa;
    });
  }

  onEtapasChange() {
    this.buscarPostulados();
  }

  refrescarPendientes() {
    this.ofertaService.getPendientesPorOferta(this.id!).subscribe(data => {
      this.pendientes = data;
      this.buscarPendientes();
    });
  }

  refrescarPostulados() {
    this.ofertaService.getPostuladosPorOferta(this.id!).subscribe(data => {
      this.postulados = data;
      this.buscarPostulados();
    });
  }

  aceptarPostulacionPendiente(pendiente: CandidatoPostuladoDTO) {
    Swal.fire({
      title: `¿Desea aceptar al candidato "${pendiente.nombreCandidato} ${pendiente.apellidoCandidato}"?`,
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico'
      }
    }).then((result) => {
    if (result.isConfirmed) {
      this.postulacionService.aceptarPostulacionPendiente(pendiente.idPostulacion).subscribe({
        next: () => {
          this.refrescarPendientes();
          this.refrescarPostulados();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El candidato se aceptó en la postulación",
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al aceptar al candidato', error);
        },
      });
      }
    });
  }

  verDetalleCandidatoPendiente(idCandidato: number) {
    this.router.navigate([`/buscar-candidatos/detalle`, idCandidato], { queryParams: { from: 'ofertaPropiaPendiente', idOferta: this.id } });
  }

  verDetalleCandidatoEnviado(idCandidato: number) {
    this.router.navigate([`/buscar-candidatos/detalle`, idCandidato], { queryParams: { from: 'ofertaPropiaEnviado', idOferta: this.id } });
  }

  verDetallePostulacion(idPostulacion: number) {
    this.router.navigate([`/postulaciones/detalle-candidato`, idPostulacion])
  }
  
  rechazarPostulacionPendiente(pendiente: CandidatoPostuladoDTO) {
    Swal.fire({
      title: `¿Desea rechazar al candidato "${pendiente.nombreCandidato} ${pendiente.apellidoCandidato}"?`,
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "No, volver",
      reverseButtons: true,
      customClass: {
        title: 'titulo-chico'
      }
    }).then((result) => {
    if (result.isConfirmed) {
      this.postulacionService.rechazarPostulacionPendiente(pendiente.idPostulacion).subscribe({
        next: () => {
          this.refrescarPendientes();
          this.refrescarPostulados();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "El candidato se rechazó en la postulación",
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al aceptar al candidato', error);
        },
      });
      }
    });
  }

  volverAListado() {
    this.router.navigate([`visualizar-ofertas`]);
  }

  isDropdownOpen: boolean = false;
  toggleDropdown() {
    if (this.estadoActual?.codigo === 'FINALIZADA') {
      return; // Si el estado es 'FINALIZADA', la función termina aquí y no hace nada más.
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectEstado(estado: EstadoOferta) {
    this.cambiarEstadoOferta(estado.codigo);
    this.isDropdownOpen = false;
  }

}