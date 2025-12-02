// notificacion-polling.service.ts
import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { timer, of, forkJoin } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { NotificacionService } from './notificacion.service';
import { Notificacion } from './notificacion';
import { TipoNotificacion } from './tiponotificacion';
import { ToastService } from './toast.service';
import { NotificacionStoreService } from './notificacion-store.service';

@Injectable({ providedIn: 'root' })
export class NotificacionPollingService {
  private userId?: number;
  private started = false;
  private seen = new Set<number>();            // 🔹 ids ya procesados
  private bc: BroadcastChannel | null = null;
  private readonly POLL_MS = 20000;
  private readonly isBrowser: boolean;

  constructor(
    private api: NotificacionService,
    private toast: ToastService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object,
    private store: NotificacionStoreService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      if ('BroadcastChannel' in window) {
        this.bc = new BroadcastChannel('workee-notif');
        this.bc.addEventListener('message', (ev: MessageEvent) => {
          if (ev.data?.type === 'BATCH_SHOWN' && Array.isArray(ev.data.ids)) {
            ev.data.ids.forEach((id: number) => this.seen.add(id));
            this.store.bumpUnread(ev.data.ids.length); // ✅ subir no leídas en otras pestañas
          }
        });
      }

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.userId) {
          this.fetchPendientes().subscribe();
        }
      });
    }
  }

  start(userId: number) {
    if (!this.isBrowser) return;
    if (this.started && this.userId === userId) return;

    this.userId = userId;
    this.started = true;

    timer(0, this.POLL_MS).pipe(
      filter(() => document.visibilityState === 'visible'),
      switchMap(() => this.fetchPendientes())
    ).subscribe();
  }

  stop() {
    this.started = false;
    this.userId = undefined;
    this.seen.clear();
    //this.store.setPendientesCount(0);
  }

  private fetchPendientes() {
    if (!this.userId || !this.isBrowser) return of(null);

    return this.api.obtenerNotificacionesPendientesPorUsuario(this.userId).pipe(
      catchError(() => of([] as Notificacion[])),
      switchMap((pendientes: Notificacion[]) => {
        if (!pendientes?.length) return of(null);

        // 🔹 Filtrar sólo las NUEVAS (no vistas)
         const nuevas = pendientes.filter(n => n.id && !this.seen.has(n.id!)) as Notificacion[];
        if (!nuevas.length) return of(null);

        const nuevosIds = nuevas.map(n => n.id!) ;
        // Marcar como vistos localmente (para no repetir)
        nuevosIds.forEach(id => this.seen.add(id));

        // 🔹 Avisar a otras pestañas
        this.bc?.postMessage({ type: 'BATCH_SHOWN', ids: nuevosIds });

        this.store.bumpUnread(nuevas.length);
        this.bc?.postMessage({ type: 'BATCH_SHOWN', ids: nuevosIds });

        // 🔹 Mostrar UN solo toast “lindo” (reemplazable por key)
        this.toast.showUnique('new-notifs', {
          title: 'Tienes notificaciones nuevas',
          message: nuevas.length === 1
            ? 'Llegó 1 notificación pendiente.'
            : `Llegaron ${nuevas.length} notificaciones pendientes.`,
          variant: 'info',
          actionLabel: 'Ver notificaciones',
          onAction: () => this.zone.run(() => this.router.navigate(['/notificaciones'])),
          timeoutMs: 8000
        });

        // 🔹 Marcar TODAS esas nuevas como ENVIADAS en backend
        const calls = nuevosIds.map(id => this.api.marcarNotificacionComoEnviada(id).pipe(catchError(() => of(void 0))));
        return forkJoin(calls);
      })
    );
  }

  // 👇 Estas helpers quedan pero ya no se usan para el batch.
  // Si en el futuro querés personalizar “variant/title” según tipo, podés reusar esto:
  private variantFromTipo(tipo?: TipoNotificacion): 'info'|'success'|'warning'|'error' {
    const t = String(tipo ?? '');
    if (t.includes('SELECCIONADO')) return 'success';
    if (t.includes('RECHAZADO') || t.includes('ELIMINADO')) return 'error';
    if (t.includes('MODIFICADO')) return 'warning';
    return 'info';
  }

  private titleFromTipo(tipo?: TipoNotificacion) {
    return (tipo ? tipo.toString().replaceAll('_', ' ').toLowerCase() : 'Notificación');
  }
}
