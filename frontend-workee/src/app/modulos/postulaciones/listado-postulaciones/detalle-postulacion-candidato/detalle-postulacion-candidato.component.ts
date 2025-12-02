import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostulacionSimplificadaDTO } from '../../postulacion-simplificada-dto';
import { PostulacionService } from '../../postulacion.service';
import { OfertaService } from '../../../oferta/oferta.service';
import { Oferta } from '../../../oferta/oferta';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Etapa } from '../../../../admin/ABMEtapa/etapa';
import { PostulacionOfertaEtapa } from '../../postulacion-oferta-etapa';
import { FormsModule } from '@angular/forms';
import { OfertaEtapa } from '../../../oferta/oferta-etapa';
import { Evento } from '../../../calendario y notificaciones/calendario y evento/evento';
import { CalendarioEventoService } from '../../../calendario y notificaciones/calendario y evento/calendarioEvento.service';

interface EtapaDetalle {
  etapa: Etapa;
  ofertaEtapa?: OfertaEtapa;
  postulacionEtapa?: PostulacionOfertaEtapa;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ACTUAL' | 'RECHAZADO' | 'ABANDONADO';
  eventos?: Evento[];
}

@Component({
  selector: 'app-detalle-postulacion-candidato',
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './detalle-postulacion-candidato.component.html',
  styleUrls: ['./detalle-postulacion-candidato.component.css']
})
export class DetallePostulacionCandidatoComponent implements OnInit {

  postulacion!: PostulacionSimplificadaDTO;
  oferta!: Oferta;
  eventos: Evento[] = [];

  etapasCombinadas: EtapaDetalle[] = [];
  etapaSeleccionada: EtapaDetalle | null = null;

  enlaceEntrega: string = '';

  constructor(
    private route: ActivatedRoute,
    private postulacionService: PostulacionService,
    private ofertaService: OfertaService,
    private router: Router,
    private eventoService: CalendarioEventoService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('idPostulacion'));
    this.postulacionService.getPostulacion(id).subscribe(data => {
      this.postulacion = data;
      this.ofertaService.getOferta(this.postulacion.idOferta).subscribe(ofertaData => {
        this.oferta = ofertaData;
        this.cargarEtapas();
      });
    });
  }

  cargarEtapas(): void {
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
    console.log("Este es el evento que recibo desde el backend: ", evento)
    if (!evento.fechaHoraInicioEvento) {
      return false;
    }
    const ahora = new Date();
    const fechaFin = new Date(evento.fechaHoraInicioEvento);
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
      error: (err) => console.error('Error cargando eventos', err)
    });
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

  realizarEntrega() {
    if (!this.etapaSeleccionada?.postulacionEtapa) return;

    const idPostulacion = this.postulacion.idPostulacionOferta;
    const idEtapa = this.etapaSeleccionada.postulacionEtapa.id;

    this.postulacionService.responderComoCandidato(idPostulacion, idEtapa, this.enlaceEntrega).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Entrega enviada',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        this.etapaSeleccionada!.postulacionEtapa!.respuestaCandidato = this.enlaceEntrega;
        this.enlaceEntrega = '';
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar la entrega',
          text: err.error?.mensaje || 'Ocurrió un error'
        });
      }
    });
  }

  abandonar() {
    Swal.fire({
      title: "¿Desea abandonar esta oferta?",
      icon: "question",
      iconColor: "#31a5dd",
      showCancelButton: true,
      confirmButtonColor: "#31a5dd",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, abandonar",
      cancelButtonText: "Volver",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.postulacionService.abandonar(this.postulacion.idPostulacionOferta).subscribe({
          next: () => {
            this.volver();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Ha abandonado la postulación', showConfirmButton: false, timer: 3000 });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error al abandonar la postulación', text: err.error.mensaje })
        });
      }
    });
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

  verDetalleEvento(ev: number) {
    this.router.navigate(['/eventos', ev]);
  }

  volver() {
    this.router.navigate(['/postulaciones']);
  }
}
