import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FiltroFechasDTO } from '../filtro-fechas-metricas.model';
import { EstadisticasEmpresaDTO } from './metricas-empresa.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetricasEmpresaService {
  private apiUrl = 'http://localhost:9090/metricas/empresa/';

  constructor(private http: HttpClient) { }

  traerEstadisticas(idEmpresa: number, filtro: FiltroFechasDTO): Observable<EstadisticasEmpresaDTO> {
    return this.http.put<EstadisticasEmpresaDTO>(this.apiUrl + idEmpresa, filtro);
  }

}
