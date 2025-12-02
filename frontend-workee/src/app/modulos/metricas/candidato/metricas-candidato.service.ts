import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltroFechasDTO } from '../filtro-fechas-metricas.model';
import { EstadisticasCandidatoDTO } from './metricas-candidato.model';

@Injectable({
  providedIn: 'root'
})
export class MetricasCandidatoService {
  private apiUrl = 'http://localhost:9090/metricas/candidato/'; 
  
  constructor(private http: HttpClient) { }

  traerEstadisticas(idCandidato: number, filtro: FiltroFechasDTO): Observable<EstadisticasCandidatoDTO> {
    return this.http.put<EstadisticasCandidatoDTO>(this.apiUrl + idCandidato, filtro);
  }
}
