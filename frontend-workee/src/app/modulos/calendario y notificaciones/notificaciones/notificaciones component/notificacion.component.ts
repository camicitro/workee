import { Component, OnInit } from '@angular/core';
import { NotificacionService } from '../notificacion.service';
import { SesionService } from '../../../../interceptors/sesion.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';
import { Notificacion } from '../notificacion';
import { CommonModule, DatePipe } from '@angular/common';    
import { Router, RouterModule } from '@angular/router';
import { NotificacionStoreService } from '../notificacion-store.service';

type NotificacionStyle = { color: string; icono: string; titulo: string };



const TIPOS_POR_ID: Record<number, string> = {
  1: 'SOLICITUD_POSTULACION_OFERTA_ACEPTADA',
  2: 'CAMBIO_ETAPA_POSTULACION',
  3: 'INVITACION_OFERTA',
  4: 'CANDIDATO_SELECCIONADO',
  5: 'CANDIDATO_RECHAZADO',
  6: 'EVENTO_ENTREGA',
  7: 'EVENTO_VIDEOLLAMADA',
  8: 'EVENTO_ELIMINADO',
  9: 'EVENTO_MODIFICADO',
  10: 'RECORDATORIO_EVENTO_3_DIAS_CANDIDATO',
  11: 'RECORDATORIO_EVENTO_1_DIA_CANDIDATO',
  12: 'RECORDATORIO_EVENTO_3_DIAS_EMPRESA',
  13: 'RECORDATORIO_EVENTO_1_DIA_EMPRESA'
};

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
})
export class NotificacionComponent implements OnInit {

  pageSize = 10;
  page = 1;

  Math = Math;

  correousuario?: string;
  idUsuario?: number;
  notificacionesObtenidas: Notificacion[] = [];
  notificacionesObtenidasPendientes: Notificacion[] = [];

  constructor(
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService,
    private sesionService: SesionService,
    private notifStore: NotificacionStoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const correo = this.sesionService.getCorreoUsuario();
    if (!correo) { console.error('No hay correo en sesión'); return; }

    const qp = this.router.parseUrl(this.router.url).queryParams;
    const p = Number(qp['page']);
    if (!Number.isNaN(p) && p >= 1) this.page = p;

    this.correousuario = correo;
    this.usuarioService.getIdPorCorreo(correo).subscribe({
      next: (id: number) => {
        this.idUsuario = id;
        this.obtenerNotificacionPorUsuario(id);
        this.obtenerNotificacionPorUsuarioPendiuente(id);
      },
      error: (err) => console.error('Error obteniendo ID del candidato', err),
    });
  }


  estilosNotificacion: Record<string, NotificacionStyle> = {
    SOLICITUD_POSTULACION_OFERTA_ACEPTADA: {
      color: '#A9F5BC', icono: 'check_circle', titulo: '¡Tu solicitud de postulación ha sido aceptada!'
    },
    CAMBIO_ETAPA_POSTULACION: {
      color: '#FFD966', icono: 'sync', titulo: 'Actualización de postulación'
    },
    INVITACION_OFERTA: {
      color: '#FFBFE2', icono: 'work', titulo: '¡Han solicitado tu participación en una oferta!'
    },
    CANDIDATO_SELECCIONADO: {
      color: '#8DE9DE', icono: 'emoji_events', titulo: '¡Has sido seleccionado!'
    },
    CANDIDATO_RECHAZADO: {
      color: '#F6B3B3', icono: 'cancel', titulo: 'Tu postulación ha sido rechazada'
    },
    EVENTO_ENTREGA: {
      color: '#AECBFA', icono: 'assignment', titulo: 'Nueva entrega'
    },
    EVENTO_VIDEOLLAMADA: {
      color: '#C3B5FD', icono: 'videocam', titulo: 'Nueva videollamada'
    },
    EVENTO_ELIMINADO: {
      color: '#F6B3B3', icono: 'delete', titulo: 'Tu evento ha sido eliminado'
    },
    EVENTO_MODIFICADO: {
      color: '#FFE599', icono: 'edit_calendar', titulo: 'Tu evento ha sido modificado'
    },
    RECORDATORIO_EVENTO_3_DIAS_CANDIDATO: {
      color: '#C8E0F4', icono: 'event', titulo: 'Recordatorio de evento'
    },
    RECORDATORIO_EVENTO_1_DIA_CANDIDATO: {
      color: '#9CC7F2', icono: 'event_upcoming', titulo: 'Recordatorio de evento'
    },
    RECORDATORIO_EVENTO_3_DIAS_EMPRESA: {
      color: '#C8E0F4', icono: 'event', titulo: 'Recordatorio de evento'
    },
    RECORDATORIO_EVENTO_1_DIA_EMPRESA: {
      color: '#9CC7F2', icono: 'event_upcoming', titulo: 'Recordatorio de evento'
    },
  };

  getPillBg(tipo: string | { id?: number } | undefined): string {
    const key = this.toTipoKey(tipo);
    return this.estilosNotificacion[key]?.color ?? '#E9EDF1';
  }

  getIcon(tipo: string | { id?: number } | undefined): string {
    const key = this.toTipoKey(tipo);
    return this.estilosNotificacion[key]?.icono ?? 'notifications';
  }

  getTitulo(tipo: string | { id?: number } | undefined): string {
    const key = this.toTipoKey(tipo);
    return this.estilosNotificacion[key]?.titulo ?? 'Notificación';
  }

  private toTipoKey(tipo: string | { id?: number } | undefined | null): string {
    if (!tipo) return '';
    if (typeof tipo === 'string') return tipo;
    const id = tipo.id;
    if (typeof id === 'number') return TIPOS_POR_ID[id] ?? '';
    return '';
  }

  getColor(tipo: string | { id?: number } | undefined): string {
    const key = this.toTipoKey(tipo);
    return this.estilosNotificacion[key]?.color ?? '#E0E0E0';
  }


obtenerNotificacionPorUsuario(idUsuario: number): void {
  this.notificacionService.obtenerNotificacionPorUsuario(idUsuario).subscribe({
    next: (notificaciones) => {
      this.notificacionesObtenidas = (notificaciones as Notificacion[]) ?? [];
      if (this.page > this.totalPages) this.setPage(this.totalPages);
      this.notifStore.setListaCompleta(this.notificacionesObtenidas); // ✅ exacto para NO LEÍDAS
    },
    error: (err) => console.error('Error obteniendo notificaciones', err),
  });
}


obtenerNotificacionPorUsuarioPendiuente(idUsuario: number): void {
  this.notificacionService.obtenerNotificacionesPendientesPorUsuario(idUsuario).subscribe({
    next: (notificaciones) => {
      this.notificacionesObtenidasPendientes = (notificaciones as Notificacion[]) ?? [];
      // ❌ NO actualizar la lista completa aquí (podría pisar la cache):
      // this.notifStore.setLista(this.notificacionesObtenidasPendientes);
    },
    error: (err) => console.error('Error obteniendo notificaciones', err),
  });
}

marcarLeidaSiHaceFalta(n: Notificacion) {
  if (!n.lecturaNotificacion) {
    n.lecturaNotificacion = true;
    this.notifStore.setLeidaLocal(n.id!); // ✅ bajar el contador al instante
    this.notificacionService.marcarNotificacionComoLeida(n.id!).subscribe({
      error: (err) => console.error('Error al marcar como leída', err)
    });
  }
}

abrirDetalle(n: Notificacion, ev?: MouseEvent) {
  if (ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button === 1)) return;

  if (!n.lecturaNotificacion) {
    n.lecturaNotificacion = true;
    this.notifStore.setLeidaLocal(n.id!); // ✅ igual acá
    this.notificacionService.marcarNotificacionComoLeida(n.id!).subscribe({
      error: (err) => console.error('Error al marcar como leída', err),
    });
  }

  this.router.navigate(['/notificacion', n.id], { state: { notificacion: n } });
  ev?.preventDefault();
}


  //paginacionnn

  get total() { return this.notificacionesObtenidas.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  get paged(): Notificacion[] {
    const start = (this.page - 1) * this.pageSize;
    return this.notificacionesObtenidas.slice(start, start + this.pageSize);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    // reflejar página en la URL
    this.router.navigate([], { queryParams: { page: this.page }, queryParamsHandling: 'merge' });
  }

  prevPage() { this.setPage(this.page - 1); }
  nextPage() { this.setPage(this.page + 1); }


}
