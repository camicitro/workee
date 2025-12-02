// notificacion-store.service.ts
import { Injectable } from '@angular/core';
import { Notificacion } from './notificacion';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificacionStoreService {
  private cache: Notificacion[] = [];

    private _unreadCount = new BehaviorSubject<number>(0);
    unreadCount$ = this._unreadCount.asObservable();

  setLista(notifs: Notificacion[]) {
    this.cache = notifs ?? [];
  }

  getLista(): Notificacion[] {
    return this.cache;
  }

  getPorId(id: number): Notificacion | undefined {
    return this.cache.find(n => n.id === id);
  }

  setListaCompleta(notifs: Notificacion[]) {
    this.cache = notifs ?? [];
    const noLeidas = this.cache.reduce((acc, n) => acc + (n?.lecturaNotificacion ? 0 : 1), 0);
    this._unreadCount.next(noLeidas);
  }

    /** bajar/ajustar el contador cuando el usuario marca una como leída */
  setLeidaLocal(id: number, leida = true) {
    const n = this.cache.find(x => x.id === id);
    const eraNoLeida = n && !n.lecturaNotificacion;
    if (n) n.lecturaNotificacion = leida;
    if (eraNoLeida && leida) {
      this._unreadCount.next(Math.max(0, this._unreadCount.value - 1));
    }
  }

  /** subir cuando llegan nuevas (aún no leídas) desde el polling */
  bumpUnread(delta: number) {
    if (!delta || delta <= 0) return;
    this._unreadCount.next(this._unreadCount.value + delta);
  }
}
