import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Notificacion } from '../notificacion';
import { NotificacionStoreService } from '../notificacion-store.service';
import { NotificacionService } from '../notificacion.service';
import { PostulacionService } from '../../../postulaciones/postulacion.service';
import Swal from 'sweetalert2';
import { PostulacionOferta } from '../../../postulaciones/postulacion-oferta';
import { PostulacionOfertaEtapa } from '../../../postulaciones/postulacion-oferta-etapa';
import { PostulacionSimplificadaDTO } from '../../../postulaciones/postulacion-simplificada-dto';

type NotificacionStyle = { color: string; icono: string; titulo: string };

const TIPOS_POR_ID: Record<number, string> = {
  1:'SOLICITUD_POSTULACION_OFERTA_ACEPTADA',2:'CAMBIO_ETAPA_POSTULACION',3:'INVITACION_OFERTA',
  4:'CANDIDATO_SELECCIONADO',5:'CANDIDATO_RECHAZADO',6:'EVENTO_ENTREGA',7:'EVENTO_VIDEOLLAMADA',
  8:'EVENTO_ELIMINADO',9:'EVENTO_MODIFICADO',10:'RECORDATORIO_EVENTO_3_DIAS_CANDIDATO',
  11:'RECORDATORIO_EVENTO_1_DIA_CANDIDATO',12:'RECORDATORIO_EVENTO_3_DIAS_EMPRESA',
  13:'RECORDATORIO_EVENTO_1_DIA_EMPRESA'
};

@Component({
  selector: 'app-detalle-notificacion',
  standalone: true,
  templateUrl: './detalle-notificacion.component.html',
  styleUrls: ['./detalle-notificacion.component.css'],
  imports: [CommonModule, RouterModule, DatePipe],
})
export class DetalleNotificacionComponent implements OnInit {

  notificacion?: Notificacion;
  idPostulacionEncontrada?: number;
  cargandoPostulacion = false;

  postulacion?: PostulacionSimplificadaDTO;
  etapaActiva?: PostulacionOfertaEtapa;


  
  estilosNotificacion: Record<string, NotificacionStyle> = {
    SOLICITUD_POSTULACION_OFERTA_ACEPTADA: { color:'#A9F5BC', icono:'check_circle', titulo:'¡Tu solicitud de postulación ha sido aceptada!' },
    CAMBIO_ETAPA_POSTULACION: { color:'#FFD966', icono:'sync', titulo:'Actualización de postulación' },
    INVITACION_OFERTA: { color:'#FFBFE2', icono:'diversity_2', titulo:'¡Han solicitado tu participación en una oferta!' },
    CANDIDATO_SELECCIONADO: { color:'#8DE9DE', icono:'emoji_events', titulo:'¡Has sido seleccionado!' },
    CANDIDATO_RECHAZADO: { color:'#F6B3B3', icono:'cancel', titulo:'Tu postulación ha sido rechazada' },
    EVENTO_ENTREGA: { color:'#AECBFA', icono:'assignment', titulo:'Nueva entrega' },
    EVENTO_VIDEOLLAMADA: { color:'#C3B5FD', icono:'videocam', titulo:'Nueva videollamada' },
    EVENTO_ELIMINADO: { color:'#F6B3B3', icono:'delete', titulo:'Tu evento ha sido eliminado' },
    EVENTO_MODIFICADO: { color:'#FFE599', icono:'edit_calendar', titulo:'Tu evento ha sido modificado' },
    RECORDATORIO_EVENTO_3_DIAS_CANDIDATO: { color:'#C8E0F4', icono:'event', titulo:'Recordatorio de evento' },
    RECORDATORIO_EVENTO_1_DIA_CANDIDATO: { color:'#9CC7F2', icono:'event_upcoming', titulo:'Recordatorio de evento' },
    RECORDATORIO_EVENTO_3_DIAS_EMPRESA: { color:'#C8E0F4', icono:'event', titulo:'Recordatorio de evento' },
    RECORDATORIO_EVENTO_1_DIA_EMPRESA: { color:'#9CC7F2', icono:'event_upcoming', titulo:'Recordatorio de evento' },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: NotificacionStoreService,
    private notificacionService: NotificacionService,
    private postulacionService: PostulacionService
  ) {}

  ngOnInit(): void {
    const state = history.state as { notificacion?: Notificacion };

    if (state?.notificacion) {
      this.notificacion = state.notificacion;
      this.marcarSiempreLeidaPorNotificacion(this.notificacion);
      if (this.notificacion.id) this.obtenerPostulacionPorIdNotificacion(this.notificacion.id);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      const encontrada = this.store.getPorId(id);
      if (encontrada) {
        this.notificacion = encontrada;
        this.marcarSiempreLeidaPorNotificacion(encontrada);
        this.obtenerPostulacionPorIdNotificacion(id);
        return;
      }

      this.marcarSiempreLeidaPorId(id);
      this.obtenerPostulacionPorIdNotificacion(id);
      return;
    }

    this.router.navigate(['/notificaciones']);
  }

  private toTipoKey(tipo: string | { id?: number } | undefined | null): string {
    if (!tipo) return '';
    if (typeof tipo === 'string') return tipo;
    const id = tipo.id;
    return typeof id === 'number' ? (TIPOS_POR_ID[id] ?? '') : '';
  }

  getPillBg(tipo: any): string { return this.estilosNotificacion[this.toTipoKey(tipo)]?.color ?? '#E5E7EB'; }
  getIcon(tipo: any): string { return this.estilosNotificacion[this.toTipoKey(tipo)]?.icono ?? 'notifications'; }
  getTitulo(tipo: any): string { return this.estilosNotificacion[this.toTipoKey(tipo)]?.titulo ?? 'Notificación'; }

  volver(): void { this.router.navigate(['/notificaciones']); }
  irEvento(id: number): void { this.router.navigate(['/eventos', id]); }
  irEventoSeguro(n: Notificacion) { const id = n.eventoNotificacion?.id; if (id != null) this.irEvento(id); }

  private marcarSiempreLeidaPorNotificacion(n: Notificacion) {
    if (n?.id == null) return;
    n.lecturaNotificacion = true; // update optimista
    this.notificacionService.marcarNotificacionComoLeida(n.id).subscribe({
      error: (err) => console.error('Error al marcar como leída', err),
    });
  }

  private marcarSiempreLeidaPorId(id: number) {
    this.notificacionService.marcarNotificacionComoLeida(id).subscribe({
      error: (err) => console.error('Error al marcar como leída (por id)', err),
    });
  }

private obtenerPostulacionPorIdNotificacion(idNotificacion: number) {
    this.cargandoPostulacion = true;
    this.postulacionService
      .obtenerpostulacionPorIdNotificacion(idNotificacion)
      .subscribe({
        next: (idPostulacion: number | null | undefined) => {
          console.log('ID de postulación obtenido:', idPostulacion);

          // Aseguramos que sea number
          this.idPostulacionEncontrada = (typeof idPostulacion === 'number') ? idPostulacion : undefined;

          if (!this.idPostulacionEncontrada) {
            console.warn('No se encontró idPostulacion para la notificación', idNotificacion);
            return;
          }

          // **AHORA** buscamos la postulación completa
          this.postulacionService.getPostulacion(this.idPostulacionEncontrada).subscribe({
            next: (postulacion) => {
              this.postulacion = postulacion;

              // Encontrar etapa activa: fecha fin “vacía” -> fechaHoraBaja === null
              const etapas = postulacion?.etapas ?? [];

              // Si hubiera más de una sin baja (no debería), nos quedamos con la más nueva
              const candidatas = etapas.filter(e => !e.fechaHoraBaja);
              this.etapaActiva = candidatas.length <= 1
                ? candidatas[0]
                : candidatas.sort((a, b) =>
                    new Date(b.fechaHoraAlta).getTime() - new Date(a.fechaHoraAlta).getTime()
                  )[0];

              console.log('Etapa activa', this.etapaActiva);
            },
            error: (err) => console.error('Error obteniendo la postulación', err),
            complete: () => this.cargandoPostulacion = false,
          });
        },
        error: (err) => {
          console.error('Error obteniendo idPostulacion', err);
          this.cargandoPostulacion = false;
        }
      });
  }

  private nombreEtapa(e?: PostulacionOfertaEtapa | null): string {
    const etapa = e?.etapa as any;
    return (etapa?.nombre ?? etapa?.nombreEtapa ?? '').toString();
  }

  get puedeResponderInvitacion(): boolean {
    if (!this.esInvitacionOferta) return false;
    const nombre = this.nombreEtapa(this.etapaActiva);
    return nombre.toUpperCase() === 'PENDIENTE';
  }

  get nombreEtapaActiva(): string {
    return this.nombreEtapa(this.etapaActiva) || '—';
  }

  aceptarPostulacionPendiente() {
    const id = this.idPostulacionEncontrada;
    if (!id) {
      Swal.fire({ icon: 'warning', title: 'No se encontró la postulación', text: 'Intenta recargar la página.' });
      return;
    }

    Swal.fire({
      title: '¿Desea postularse a la oferta?',
      icon: 'question',
      iconColor: '#31A5DD',
      showCancelButton: true,
      confirmButtonColor: '#31A5DD',
      cancelButtonColor: '#697077',
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'No, volver',
      reverseButtons: true,
      customClass: { title: 'titulo-chico' }
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.postulacionService.aceptarPostulacionPendiente(id).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Te has postulado a la oferta correctamente',
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al aceptar la postulación', error);
          Swal.fire({ icon: 'error', title: 'No se pudo aceptar la postulación' });
        },
      });
    });
  }

  rechazarPostulacionPendiente() {
    const id = this.idPostulacionEncontrada;
    if (!id) {
      Swal.fire({ icon: 'warning', title: 'No se encontró la postulación', text: 'Intenta recargar la página.' });
      return;
    }

    Swal.fire({
      title: '¿Rechazar esta postulación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.postulacionService.rechazarPostulacionComoCandidato(id).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Has rechazado la postulación',
            timer: 3000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al rechazar la postulación', error);
          Swal.fire({ icon: 'error', title: 'No se pudo rechazar la postulación' });
        },
      });
    });
  }

  get esInvitacionOferta(): boolean {
    const t = this.notificacion?.tipoNotificacion;
    if (!t) return false;

    // tu helper ya mapea id→string
    const key = typeof t === 'string' ? t : (typeof t.id === 'number' ? TIPOS_POR_ID[t.id] : '');
    return key === 'INVITACION_OFERTA';
  }


  
}
