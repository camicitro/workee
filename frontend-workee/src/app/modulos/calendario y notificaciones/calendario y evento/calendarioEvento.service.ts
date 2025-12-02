import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from './evento';

@Injectable({ providedIn: 'root' })
export class CalendarioEventoService {
  private url = 'http://localhost:9090/eventos';

  constructor(private http: HttpClient) {}

  crearEvento(nombreEvento: string,
              descripcionEvento: string,
              idTipoEvento: number,
              fechaHoraInicioEvento: string,
              fechaHoraFinEvento: string,
              idPostulacionOfertaEtapa: number,
              idUsuarioCandidato: number,
              idUsuarioEmpleado: number)
  : Observable<Evento> {
    const body = {
      "nombreEvento": nombreEvento,
      "descripcionEvento": descripcionEvento,
      "idTipoEvento": idTipoEvento,
      "fechaHoraInicioEvento": fechaHoraInicioEvento,
      "fechaHoraFinEvento": fechaHoraFinEvento,
      "idPostulacionOfertaEtapa": idPostulacionOfertaEtapa,
      "idUsuarioCandidato": idUsuarioCandidato,
      "idUsuarioEmpleado": idUsuarioEmpleado,
      "enlaceVideollamada": null
    }
    console.log("este es el body que voy a mandar: ", body)
    return this.http.post<Evento>(`${this.url}`, body);
  }

  modificarEventoPorId(idEvento: number, payload: any): Observable<Evento> {
    return this.http.put<Evento>(`${this.url}/${idEvento}`, payload);
  }

  eliminarEventoPorId(idEvento: number): Observable<string> {
    return this.http.delete(`${this.url}/${idEvento}`, { responseType: 'text' });
  }

  getEventoById(idEvento: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.url}/${idEvento}`);
  }

  getEventosPorUsuario(idUsuario: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.url}/usuario/${idUsuario}`);
  }

  getEventosPorEmpresa(idEmpresa: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.url}/empresa/${idEmpresa}`);
  }

  getEventosPorPostulacion(idPostulacion: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.url}/postulacion/${idPostulacion}`);
  }
}
