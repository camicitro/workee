import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfertaService } from '../../oferta/oferta.service';
import { PostulacionService } from '../postulacion.service';
import { Oferta } from '../../oferta/oferta';
import { PostulacionSimplificadaDTO } from '../postulacion-simplificada-dto';
import { CandidatoService } from '../../candidato/candidato.service';
import { Candidato } from '../../candidato/candidato';
import { CommonModule, DatePipe } from '@angular/common';
import { PostulacionOfertaEtapa } from '../postulacion-oferta-etapa';
import { Etapa } from '../../../admin/ABMEtapa/etapa';
import { OfertaEtapa } from '../../oferta/oferta-etapa';
import { Evento } from '../../calendario y notificaciones/calendario y evento/evento';
import { CalendarioEventoService } from '../../calendario y notificaciones/calendario y evento/calendarioEvento.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../compartidos/modal/modal.service';
import { ModalActualizacionEtapaComponent } from './modal-actualizacion-etapa/modal-actualizacion-etapa.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CreacionEventoComponent } from '../../calendario y notificaciones/calendario y evento/creacion evento modal/creacion-evento.component';
import { SpinnerComponent } from '../../../compartidos/spinner/spinner/spinner.component';

interface EtapaDetalle {
  etapa: Etapa;
  ofertaEtapa?: OfertaEtapa;
  postulacionEtapa?: PostulacionOfertaEtapa;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ACTUAL' | 'RECHAZADO' | 'ABANDONADO';
  eventos?: Evento[];
}

@Component({
  selector: 'app-detalle-postulacion-empresa',
  imports: [DatePipe, CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './detalle-postulacion-empresa.component.html',
  styleUrl: './detalle-postulacion-empresa.component.css'
})
export class DetallePostulacionEmpresaComponent implements OnInit {
  
  postulacion!: PostulacionSimplificadaDTO;
  oferta!: Oferta;
  eventos: Evento[] = [];

  candidato!: Candidato;

  etapasCombinadas: EtapaDetalle[] = [];
  etapaSeleccionada: EtapaDetalle | null = null;

  modalRef?: NgbModalRef;

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private postulacionService: PostulacionService,
    private ofertaService: OfertaService,
    private candidatoService: CandidatoService,
    private eventoService: CalendarioEventoService,
    private router: Router,
    private modalService: ModalService,
  ) {}
  
  ngOnInit() {
    this.isLoading = true;
    const id = Number(this.route.snapshot.paramMap.get('idPostulacion'));
    this.postulacionService.getPostulacion(id).subscribe(data => {
      this.postulacion = data;
      this.ofertaService.getOferta(this.postulacion.idOferta).subscribe(ofertaData => {
        this.oferta = ofertaData;
        this.cargarEtapas();
        this.candidatoService.findById(this.postulacion.idCandidato).subscribe(candidatoData => {
          this.candidato = candidatoData;
        });
      });
    });
  }

  cargarEtapas(): void {
    this.isLoading = true
    if (!this.oferta || !this.oferta.ofertaEtapas) return;

    const mapaPost = new Map<string, PostulacionOfertaEtapa>();
    for (const pe of this.postulacion.etapas || []) {
      if (pe.etapa?.codigoEtapa) mapaPost.set(pe.etapa.codigoEtapa, pe);
    }

    const pasoRechazo = (this.postulacion.etapas || []).find(ep => ep.etapa?.codigoEtapa === 'RECHAZADO');
    const pasoAbandono = (this.postulacion.etapas || []).find(ep => ep.etapa?.codigoEtapa === 'ABANDONADO');
    const fueSeleccionado = !!this.postulacion.fechaHoraFinPostulacionOferta;

    this.etapasCombinadas = this.oferta.ofertaEtapas
      .filter(oe => oe.etapa.codigoEtapa !== 'RECHAZADO' && oe.etapa.codigoEtapa !== 'ABANDONADO')
      .sort((a, b) => (a.numeroEtapa ?? 0) - (b.numeroEtapa ?? 0))
      .map(oe => {
        const postulacionEtapa = mapaPost.get(oe.etapa.codigoEtapa || '');
        let estado: EtapaDetalle['estado'] = 'PENDIENTE';

        if (pasoRechazo) {
          // Si fue rechazado, mostrar la etapa de rechazo como tal
          estado = (oe.etapa.codigoEtapa === this.getCodigoEtapaRechazoTarget()) ? 'RECHAZADO' :
                  (postulacionEtapa?.fechaHoraBaja ? 'COMPLETADA' : 'PENDIENTE');
        } 
        else if (pasoAbandono) {
          // Si abandonó, mostrar la etapa en la que abandonó
          estado = (oe.etapa.codigoEtapa === this.getCodigoEtapaAbandonoTarget()) ? 'ABANDONADO' :
                  (postulacionEtapa?.fechaHoraBaja ? 'COMPLETADA' : 'PENDIENTE');
        } 
        else {
          // No rechazo ni abandono
          if (postulacionEtapa) {
            estado = postulacionEtapa.fechaHoraBaja ? 'COMPLETADA' : 'ACTUAL';
            if (estado === 'ACTUAL') {
              this.etapaSeleccionada = { etapa: oe.etapa, ofertaEtapa: oe, postulacionEtapa, estado };
            }
          }
        }

        if (fueSeleccionado && estado === 'ACTUAL') estado = 'COMPLETADA';

        return { etapa: oe.etapa, ofertaEtapa: oe, postulacionEtapa, estado };
      });

    // Si hay rechazo o abandono, seleccionar automáticamente esa etapa
    if (pasoRechazo) {
      this.etapaSeleccionada = this.etapasCombinadas.find(e => e.estado === 'RECHAZADO') || null;
    } else if (pasoAbandono) {
      this.etapaSeleccionada = this.etapasCombinadas.find(e => e.estado === 'ABANDONADO') || null;
    }

    this.cargarEventos();
  }

  eventoFinalizado(evento: Evento): boolean {
    if (!evento.fechaHoraFinEvento) {
      return false;
    }
    const ahora = new Date();
    const fechaFin = new Date(evento.fechaHoraFinEvento);
    return ahora > fechaFin;
  }

  cargarEventos() {
    const idPostulacion = this.postulacion.idPostulacionOferta;
    this.eventoService.getEventosPorPostulacion(idPostulacion).subscribe({
      next: (resp) => {
        this.eventos = resp;
        this.asociarEventosAEtapas();

        if (this.etapaSeleccionada) {
          const idEtapaSel = this.etapaSeleccionada.postulacionEtapa?.id;
          this.etapaSeleccionada.eventos = this.eventos.filter(
            ev => ev.postulacionOfertaEtapa?.id === idEtapaSel
          );
        }
      },
      // error: (err) => console.error('Error cargando eventos', err)
    });
    this.isLoading = false;
  }

  asociarEventosAEtapas() {
    this.etapasCombinadas.forEach((etapa) => {
      const idEtapa = etapa.postulacionEtapa?.id;
      etapa.eventos = this.eventos.filter(
        (ev) => ev.postulacionOfertaEtapa?.id === idEtapa
      );
    });
  }

  getCodigoEtapaRechazoTarget(): string | null {
    const etapasPost = this.postulacion.etapas?.filter(ep => ep.etapa?.codigoEtapa !== 'RECHAZADO' && ep.fechaHoraAlta)
      .sort((a, b) => new Date(a.fechaHoraAlta!).getTime() - new Date(b.fechaHoraAlta!).getTime());
    return etapasPost && etapasPost.length ? etapasPost[etapasPost.length - 1].etapa?.codigoEtapa || null : null;
  }

  getCodigoEtapaAbandonoTarget(): string | null {
    const etapasPost = this.postulacion.etapas
      ?.filter(ep => ep.etapa?.codigoEtapa !== 'ABANDONADO' && ep.fechaHoraAlta)
      .sort((a, b) => new Date(a.fechaHoraAlta!).getTime() - new Date(b.fechaHoraAlta!).getTime());
    return etapasPost && etapasPost.length ? etapasPost[etapasPost.length - 1].etapa?.codigoEtapa || null : null;
  }

  seleccionarEtapa(etapa: EtapaDetalle) {
    this.etapaSeleccionada = etapa;
  }

  fechaFormateada(evento:Evento): string {
    if (!evento?.fechaHoraInicioEvento) return '';

    const inicio = new Date(evento.fechaHoraInicioEvento);
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return inicio.toLocaleDateString('es-ES', opcionesFecha);
  }

  horaFormateada(evento:Evento): string {
    if (!evento?.fechaHoraInicioEvento) return '';

    const inicio = new Date(evento.fechaHoraInicioEvento);
    const fin = evento?.fechaHoraFinEvento
      ? new Date(evento.fechaHoraFinEvento)
      : new Date(inicio.getTime() + 60 * 60 * 1000); // 1h por defecto

    const horaInicio = inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const horaFin = fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const duracionMinutos = Math.round((fin.getTime() - inicio.getTime()) / 60000);
    const duracion = duracionMinutos >= 60
      ? `${Math.floor(duracionMinutos / 60)}h${duracionMinutos % 60 ? ' ' + (duracionMinutos % 60) + 'm' : ''}`
      : `${duracionMinutos}m`;

    return `${horaInicio} - ${horaFin} (${duracion})`;
  }

  mostrarNombreArchivoCV(enlace: string | undefined): string { 
    if (!enlace) return '';
    try {
      const start = enlace.indexOf('/o/');
      const mid = enlace.indexOf('?', start);
      if (start === -1) return enlace;

      let nombreEnc = enlace.substring(start + 3, mid !== -1 ? mid : enlace.length);
      let nombreDec = decodeURIComponent(nombreEnc);

      const partes = nombreDec.split('/');
      return partes[partes.length - 1];
    } catch {
      return enlace;
    }
  }

  actualizarEtapa() {
    this.modalRef = this.modalService.open(ModalActualizacionEtapaComponent, {
      centered: true,
    });
    
    this.modalRef.componentInstance.idPostulacion = this.postulacion.idPostulacionOferta;
    this.modalRef.componentInstance.idOferta = this.postulacion.idOferta;

    // Determinar la etapa actual
    const etapaActual = this.postulacion.etapas[this.postulacion.etapas.length - 1];
    this.modalRef.componentInstance.etapaActual = etapaActual;

    this.modalRef.closed.subscribe((result) => {
      if (result === 'etapaActualizada') {
        this.recargarPostulacion(); // nuevo método
      }
    });
  }

  private recargarPostulacion() {
    this.postulacionService.getPostulacion(this.postulacion.idPostulacionOferta).subscribe((data) => {
      this.postulacion = data;
      this.cargarEtapas();
    });
  }
  
  async enviarRetroalimentacion(postOferta: number) {
  const { value: texto } = await Swal.fire({
    input: "textarea",
    title: "Retroalimentación",
    inputPlaceholder: "Escribe la retroalimentación...",
    inputAttributes: {
      "aria-label": "Type your message here",
      maxlength: '350',
      minlength: '5'
    },
    showCancelButton: true,
    confirmButtonColor: '#10c036',
    cancelButtonColor: '#697077',
    confirmButtonText: "Enviar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    preConfirm: (value) => {
      const textoTrim = (value || '').toString().trim();

      if (!textoTrim) {
        Swal.showValidationMessage('La retroalimentación no puede estar vacía.');
        return;
      }
      if (textoTrim.length < 5) {
        Swal.showValidationMessage('La retroalimentación debe tener al menos 5 caracteres.');
        return;
      }
      if (textoTrim.length > 350) {
        Swal.showValidationMessage('La retroalimentación no puede superar los 350 caracteres.');
        return;
      }

      return textoTrim; // si todo OK, se retorna el texto y el modal se cierra
    }
  });

  //if (result.isConfirmed) {
  if (texto) {
    //const texto = result.value?.trim();

    /*if (!texto) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor ingrese una retroalimentación antes de enviar.',
      });
      return;
    }

    if (texto.length < 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Texto demasiado corto',
        text: 'La retroalimentación debe tener al menos 5 caracteres.',
      });
      return;
    }

    if (texto.length > 350) {
      Swal.fire({
        icon: 'warning',
        title: 'Texto demasiado largo',
        text: 'La retroalimentación no puede superar los 350 caracteres.',
      });
      return;
    }*/

    this.postulacionService.enviarRetroalimentacion(
      this.postulacion.idPostulacionOferta,
      postOferta,
      //result.value
      texto
    ).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-right',
          text: 'Retroalimentación enviada al candidato',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        });

        // 🔄 Refrescar datos para mostrar la retroalimentación recién enviada
        this.recargarPostulacion();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          text: 'No se pudo enviar la retroalimentación. Intente nuevamente.'
        });
      }
    });
  }
}


  agendarEvento(idPostOfEtapa: number) {
    this.modalRef = this.modalService.open(CreacionEventoComponent, {
      centered: true,
      scrollable: true,
      size: 'lg'
    });

    this.modalRef.componentInstance.idPostulacionOfertaEtapa = idPostOfEtapa;
    this.modalRef.componentInstance.idUsuarioCandidato = this.candidato.usuario?.id;
    this.modalRef.componentInstance.idUsuarioEmpleado = this.etapaSeleccionada?.ofertaEtapa?.empleadoEmpresa.usuario?.id ?? null;

    this.modalRef.componentInstance.eventoCreado.subscribe(() => {
      this.cargarEventos();
    });
  }


  verDetalleEvento(ev: number) {
    this.router.navigate(
      ['/eventos', ev],
      {
        queryParams: {
          from: 'postulacion',
          back: this.router.url   // <-- vuelve exactamente al detalle actual
        }
      }
    );
  }


  volverAOferta() {
    this.router.navigate(['/visualizar-oferta', this.oferta.id]);
  }

}
