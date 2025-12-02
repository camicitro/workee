import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion } from './notificacion';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private url = 'http://localhost:9090/notificaciones';

  constructor(private http: HttpClient) {}

  idUsuario?: number;

  obtenerNotificacionPorUsuario(idUsuario: number) {
    return this.http.get<Notificacion[]>(`${this.url}/usuario/${idUsuario}`);
  }
  obtenerNotificacionesPendientesPorUsuario(idUsuario: number) {
    return this.http.get<Notificacion[]>(`${this.url}/pendientes/usuario/${idUsuario}`);
  }

  marcarNotificacionComoLeida(idNotificacion: number): Observable<void> {
    return this.http.put<void>(`${this.url}/leida/${idNotificacion}`, {});
  }

  marcarNotificacionComoEnviada(idNotificacion: number): Observable<void> {
    return this.http.put<void>(`${this.url}/enviada/${idNotificacion}`, {});
  }


}
